import { Account, RpcProvider, PaymasterRpc, hash, } from "starknet";
import { Tx } from "../tx/index.js";
import { AccountProvider } from "../wallet/accounts/provider.js";
import { SignerAdapter } from "../signer/index.js";
import { checkDeployed, ensureWalletReady, preflightTransaction, sponsoredDetails, } from "../wallet/utils.js";
import { BaseWallet } from "../wallet/base.js";
import { BraavosPreset, BRAAVOS_IMPL_CLASS_HASH, OpenZeppelinPreset, } from "../account/presets.js";
// Braavos factory address (same on Sepolia and Mainnet)
const BRAAVOS_FACTORY_ADDRESS = "0x3d94f65ebc7552eb517ddb374250a9525b605f25f4e41ded6e7d7381ff1c2e8";
const NEGATIVE_DEPLOYMENT_CACHE_TTL_MS = 3000;
export {} from "../wallet/interface.js";
export { BaseWallet } from "../wallet/base.js";
export { AccountProvider } from "../wallet/accounts/provider.js";
export class Wallet extends BaseWallet {
    constructor(options) {
        super(options.address, options.stakingConfig);
        /** Cached deployment status (null = not checked yet) */
        this.deployedCache = null;
        this.deployedCacheExpiresAt = 0;
        this.sponsoredDeployLock = null;
        this.accountProvider = options.accountProvider;
        this.account = options.account;
        this.provider = options.provider;
        this.chainId = options.chainId;
        this.explorerConfig = options.explorerConfig;
        this.defaultFeeMode = options.defaultFeeMode;
        this.defaultTimeBounds = options.defaultTimeBounds;
    }
    /**
     * Create a new Wallet instance.
     *
     * @example
     * ```ts
     * // With signer (address computed from public key)
     * const wallet = await Wallet.create({
     *   account: { signer: new StarkSigner(privateKey), accountClass: ArgentPreset },
     *   provider,
     *   config,
     * });
     *
     * // With known address (skips address computation)
     * const wallet = await Wallet.create({
     *   account: { signer: new StarkSigner(privateKey) },
     *   address: "0x123...",
     *   provider,
     *   config,
     * });
     * ```
     */
    static async create(options) {
        const { account: accountInput, provider, config, accountAddress: providedAddress, feeMode = "user_pays", timeBounds, swapProviders, defaultSwapProviderId, } = options;
        // Build or use provided AccountProvider
        const accountProvider = accountInput instanceof AccountProvider
            ? accountInput
            : new AccountProvider(accountInput.signer, accountInput.accountClass);
        // Use provided address or compute from account provider
        const address = providedAddress ?? (await accountProvider.getAddress());
        const signer = accountProvider.getSigner();
        // Create starknet.js Account with our signer adapter
        const signerAdapter = new SignerAdapter(signer);
        // Create PaymasterRpc instance if paymaster config is provided
        const paymaster = config.paymaster
            ? new PaymasterRpc(config.paymaster)
            : undefined;
        const account = new Account({
            provider,
            address,
            signer: signerAdapter,
            ...(paymaster && { paymaster }),
        });
        if (!config.chainId) {
            throw new Error("Wallet requires 'chainId' in the SDK config. Use 'network' or set 'chainId' explicitly.");
        }
        const wallet = new Wallet({
            address,
            accountProvider,
            account,
            provider,
            chainId: config.chainId,
            ...(config.explorer && { explorerConfig: config.explorer }),
            defaultFeeMode: feeMode,
            ...(timeBounds && { defaultTimeBounds: timeBounds }),
            stakingConfig: options.config.staking,
        });
        if (swapProviders?.length) {
            for (const swapProvider of swapProviders) {
                wallet.registerSwapProvider(swapProvider);
            }
        }
        if (defaultSwapProviderId) {
            wallet.setDefaultSwapProvider(defaultSwapProviderId);
        }
        return wallet;
    }
    async isDeployed() {
        const now = Date.now();
        // Return cached result if we know it's deployed
        if (this.deployedCache === true) {
            return true;
        }
        if (this.deployedCache === false && now < this.deployedCacheExpiresAt) {
            return false;
        }
        const deployed = await checkDeployed(this.provider, this.address);
        if (deployed) {
            this.deployedCache = true;
            this.deployedCacheExpiresAt = Number.POSITIVE_INFINITY;
        }
        else {
            this.deployedCache = false;
            this.deployedCacheExpiresAt = now + NEGATIVE_DEPLOYMENT_CACHE_TTL_MS;
        }
        return deployed;
    }
    clearDeploymentCache() {
        this.deployedCache = null;
        this.deployedCacheExpiresAt = 0;
    }
    async withSponsoredDeployLock(work) {
        while (this.sponsoredDeployLock) {
            await this.sponsoredDeployLock;
        }
        let releaseLock;
        this.sponsoredDeployLock = new Promise((resolve) => {
            releaseLock = resolve;
        });
        try {
            return await work();
        }
        finally {
            releaseLock?.();
            this.sponsoredDeployLock = null;
        }
    }
    async ensureReady(options = {}) {
        return ensureWalletReady(this, options);
    }
    async deploy(options = {}) {
        this.clearDeploymentCache();
        const feeMode = options.feeMode ?? this.defaultFeeMode;
        const timeBounds = options.timeBounds ?? this.defaultTimeBounds;
        if (feeMode === "sponsored") {
            const tx = await this.deployPaymasterWith([], timeBounds);
            return tx;
        }
        const classHash = this.accountProvider.getClassHash();
        const publicKey = await this.accountProvider.getPublicKey();
        const addressSalt = this.accountProvider.getSalt(publicKey);
        const constructorCalldata = this.accountProvider.getConstructorCalldata(publicKey);
        const multiply2x = (value) => {
            return {
                max_amount: value.max_amount * 2n,
                max_price_per_unit: value.max_price_per_unit * 2n,
            };
        };
        // Default resource bounds when estimate fails. L2 must cover Braavos deploy (~1M gas); prices meet network minimums (~47e12 for L1).
        const DEFAULT_DEPLOY_RESOURCE_BOUNDS = {
            l1_gas: { max_amount: 50000n, max_price_per_unit: 50000000000000n },
            l2_gas: {
                max_amount: 1100000n,
                max_price_per_unit: 50000000000000n,
            },
            l1_data_gas: {
                max_amount: 50000n,
                max_price_per_unit: 50000000000000n,
            },
        };
        let resourceBounds;
        try {
            const estimateFee = await this.account.estimateAccountDeployFee({
                classHash,
                constructorCalldata,
                addressSalt,
            });
            const { l1_gas, l2_gas, l1_data_gas } = estimateFee.resourceBounds;
            resourceBounds = {
                l1_gas: multiply2x(l1_gas),
                l2_gas: multiply2x(l2_gas),
                l1_data_gas: multiply2x(l1_data_gas),
            };
        }
        catch {
            resourceBounds = DEFAULT_DEPLOY_RESOURCE_BOUNDS;
        }
        const { transaction_hash } = await this.account.deployAccount({ classHash, constructorCalldata, addressSalt }, { resourceBounds });
        return new Tx(transaction_hash, this.provider, this.chainId, this.explorerConfig);
    }
    async deployPaymasterWith(calls, timeBounds) {
        this.clearDeploymentCache();
        const classHash = this.accountProvider.getClassHash();
        // Special handling for Braavos - deploy via factory
        if (classHash === BraavosPreset.classHash) {
            return this.deployBraavosViaFactory(calls, timeBounds);
        }
        // Standard deployment flow
        const deploymentData = await this.accountProvider.getDeploymentData();
        const { transaction_hash } = await this.account.executePaymasterTransaction(calls, sponsoredDetails(timeBounds ?? this.defaultTimeBounds, deploymentData));
        return new Tx(transaction_hash, this.provider, this.chainId, this.explorerConfig);
    }
    /**
     * Deploy a Braavos account via the Braavos factory.
     *
     * This works by:
     * 1. Deploying a temporary OZ account (same public key) via paymaster
     * 2. Using that OZ account to call the Braavos factory
     * 3. The factory deploys the Braavos account
     */
    async deployBraavosViaFactory(calls, timeBounds) {
        const publicKey = await this.accountProvider.getPublicKey();
        const signer = this.accountProvider.getSigner();
        // Create a temporary OZ account provider for deployment
        const ozProvider = new AccountProvider(signer, OpenZeppelinPreset);
        const ozAddress = await ozProvider.getAddress();
        // Check if OZ bootstrap account is already deployed
        const ozDeployed = await checkDeployed(this.provider, ozAddress);
        // Build Braavos deployment params
        // Format: [impl_class_hash, ...9 zeros, chain_id, aux_sig_r, aux_sig_s]
        const chainIdFelt = this.chainId.toFelt252();
        // Build the aux data to sign: [impl_class_hash, 9 zeros, chain_id]
        const auxData = [
            BRAAVOS_IMPL_CLASS_HASH, // Implementation class hash
            "0x0",
            "0x0",
            "0x0",
            "0x0",
            "0x0",
            "0x0",
            "0x0",
            "0x0",
            "0x0", // 9 zeros for basic account
            chainIdFelt, // Chain ID
        ];
        // Hash the aux data with poseidon
        const auxHash = hash.computePoseidonHashOnElements(auxData);
        // Sign the aux hash
        const auxSignature = await signer.signRaw(auxHash);
        // Extract r and s from signature (handle both array and ArraySignatureType)
        const sigArray = Array.isArray(auxSignature)
            ? auxSignature
            : [auxSignature.r, auxSignature.s];
        if (!sigArray[0] || !sigArray[1]) {
            throw new Error("Invalid signature format from signer");
        }
        // Build the full additional_deployment_params
        const additionalParams = [
            ...auxData,
            String(sigArray[0]),
            String(sigArray[1]),
        ];
        // Build the factory call
        const factoryCall = {
            contractAddress: BRAAVOS_FACTORY_ADDRESS,
            entrypoint: "deploy_braavos_account",
            calldata: [
                publicKey,
                String(additionalParams.length),
                ...additionalParams,
            ],
        };
        // Create starknet.js Account for the OZ bootstrap account
        const signerAdapter = new SignerAdapter(signer);
        const paymaster = this.account.paymaster;
        const ozAccount = new Account({
            provider: this.provider,
            address: ozAddress,
            signer: signerAdapter,
            ...(paymaster && { paymaster }),
        });
        let transactionHash;
        if (ozDeployed) {
            // OZ is deployed, just call the factory
            const allCalls = [factoryCall, ...calls];
            const result = await ozAccount.executePaymasterTransaction(allCalls, sponsoredDetails(timeBounds ?? this.defaultTimeBounds));
            transactionHash = result.transaction_hash;
        }
        else {
            // Deploy OZ and call factory in one transaction
            const ozDeploymentData = await ozProvider.getDeploymentData();
            const allCalls = [factoryCall, ...calls];
            const result = await ozAccount.executePaymasterTransaction(allCalls, sponsoredDetails(timeBounds ?? this.defaultTimeBounds, ozDeploymentData));
            transactionHash = result.transaction_hash;
        }
        return new Tx(transactionHash, this.provider, this.chainId, this.explorerConfig);
    }
    async execute(calls, options = {}) {
        const feeMode = options.feeMode ?? this.defaultFeeMode;
        const timeBounds = options.timeBounds ?? this.defaultTimeBounds;
        let transactionHash;
        if (feeMode === "sponsored") {
            const deployed = await this.isDeployed();
            if (deployed) {
                transactionHash = (await this.account.executePaymasterTransaction(calls, sponsoredDetails(timeBounds))).transaction_hash;
            }
            else {
                transactionHash = await this.withSponsoredDeployLock(async () => {
                    const recheckedDeployed = await this.isDeployed();
                    if (recheckedDeployed) {
                        return (await this.account.executePaymasterTransaction(calls, sponsoredDetails(timeBounds))).transaction_hash;
                    }
                    try {
                        return (await this.deployPaymasterWith(calls, timeBounds)).hash;
                    }
                    catch (error) {
                        if (!isAlreadyDeployedError(error)) {
                            throw error;
                        }
                        return (await this.account.executePaymasterTransaction(calls, sponsoredDetails(timeBounds))).transaction_hash;
                    }
                });
            }
        }
        else {
            const deployed = await this.isDeployed();
            if (!deployed) {
                throw new Error('Account is not deployed. Call wallet.ensureReady({ deploy: "if_needed" }) before execute() in user_pays mode.');
            }
            transactionHash = (await this.account.execute(calls)).transaction_hash;
        }
        return new Tx(transactionHash, this.provider, this.chainId, this.explorerConfig);
    }
    async signMessage(typedData) {
        return this.account.signMessage(typedData);
    }
    async preflight(options) {
        const feeMode = options.feeMode ?? this.defaultFeeMode;
        return preflightTransaction(this, this.account, {
            ...options,
            feeMode,
        });
    }
    getAccount() {
        return this.account;
    }
    getProvider() {
        return this.provider;
    }
    /**
     * Get the chain ID this wallet is connected to.
     */
    getChainId() {
        return this.chainId;
    }
    /**
     * Get the default fee mode for this wallet.
     */
    getFeeMode() {
        return this.defaultFeeMode;
    }
    /**
     * Get the account class hash.
     */
    getClassHash() {
        return this.accountProvider.getClassHash();
    }
    /**
     * Estimate the fee for executing calls.
     *
     * @example
     * ```ts
     * const fee = await wallet.estimateFee([
     *   { contractAddress: "0x...", entrypoint: "transfer", calldata: [...] }
     * ]);
     * console.log(`Estimated fee: ${fee.overall_fee}`);
     * ```
     */
    async estimateFee(calls) {
        return this.account.estimateInvokeFee(calls);
    }
    async disconnect() {
        this.clearCaches();
        this.clearDeploymentCache();
    }
}
function isAlreadyDeployedError(error) {
    const message = (error instanceof Error ? error.message : String(error)).toLowerCase();
    return (message.includes("already deployed") ||
        message.includes("account already exists") ||
        message.includes("contract already exists"));
}
//# sourceMappingURL=index.js.map