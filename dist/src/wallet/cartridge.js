import { RpcProvider, } from "starknet";
import { Tx } from "../tx/index.js";
import { ChainId, getChainId, fromAddress, } from "../types/index.js";
import { checkDeployed, ensureWalletReady, preflightTransaction, sponsoredDetails, } from "../wallet/utils.js";
import { BaseWallet } from "../wallet/base.js";
import { assertSafeHttpUrl } from "../utils/index.js";
const NEGATIVE_DEPLOYMENT_CACHE_TTL_MS = 3000;
const MAX_CONTROLLER_WAIT_MS = 10000;
const INITIAL_CONTROLLER_POLL_MS = 100;
const MAX_CONTROLLER_POLL_MS = 1000;
function cartridgeDependencyError(extra) {
    return new Error("Cartridge integration requires '@cartridge/controller'. Install it in your app dependencies to use connectCartridge()." +
        (extra ? ` ${extra}` : ""));
}
async function loadCartridgeControllerModule() {
    let imported;
    try {
        imported = await import("@cartridge/controller");
    }
    catch (error) {
        const details = error instanceof Error && error.message
            ? `Original error: ${error.message}`
            : undefined;
        throw cartridgeDependencyError(details);
    }
    const mod = imported;
    if (typeof mod.default !== "function" ||
        typeof mod.toSessionPolicies !== "function") {
        throw cartridgeDependencyError("Loaded module does not expose expected exports.");
    }
    return mod;
}
/**
 * Wallet implementation using Cartridge Controller.
 *
 * Cartridge Controller provides a seamless onboarding experience with:
 * - Social login (Google, Discord)
 * - WebAuthn (passkeys)
 * - Session policies for gasless transactions
 *
 * @example
 * ```ts
 * const wallet = await CartridgeWallet.create({
 *   rpcUrl: "https://api.cartridge.gg/x/starknet/mainnet",
 *   policies: [{ target: "0xCONTRACT", method: "transfer" }]
 * });
 *
 * await wallet.execute([...]);
 *
 * // Access Cartridge-specific features
 * const controller = wallet.getController();
 * controller.openProfile();
 * ```
 */
export class CartridgeWallet extends BaseWallet {
    constructor(controller, walletAccount, provider, chainId, classHash, stakingConfig, options = {}) {
        super(fromAddress(walletAccount.address), stakingConfig);
        this.deployedCache = null;
        this.deployedCacheExpiresAt = 0;
        this.controller = controller;
        this.walletAccount = walletAccount;
        this.provider = provider;
        this.classHash = classHash;
        this.chainId = chainId;
        this.explorerConfig = options.explorer;
        this.defaultFeeMode = options.feeMode ?? "user_pays";
        this.defaultTimeBounds = options.timeBounds;
    }
    /**
     * Create and connect a CartridgeWallet.
     */
    static async create(options = {}, stakingConfig) {
        const { default: Controller, toSessionPolicies } = await loadCartridgeControllerModule();
        const controllerOptions = {};
        if (options.chainId) {
            controllerOptions.defaultChainId = options.chainId.toFelt252();
        }
        if (options.rpcUrl) {
            const rpcUrl = assertSafeHttpUrl(options.rpcUrl, "Cartridge RPC URL").toString();
            controllerOptions.chains = [{ rpcUrl }];
        }
        if (options.policies && options.policies.length > 0) {
            controllerOptions.policies = toSessionPolicies(options.policies);
        }
        if (options.preset) {
            controllerOptions.preset = options.preset;
        }
        if (options.url) {
            controllerOptions.url = assertSafeHttpUrl(options.url, "Cartridge controller URL").toString();
        }
        const controller = new Controller(controllerOptions);
        let waited = 0;
        let pollIntervalMs = INITIAL_CONTROLLER_POLL_MS;
        while (!controller.isReady() && waited < MAX_CONTROLLER_WAIT_MS) {
            const sleepMs = Math.min(pollIntervalMs, MAX_CONTROLLER_WAIT_MS - waited);
            await new Promise((resolve) => setTimeout(resolve, sleepMs));
            waited += sleepMs;
            pollIntervalMs = Math.min(pollIntervalMs * 2, MAX_CONTROLLER_POLL_MS);
        }
        if (!controller.isReady()) {
            throw new Error("Cartridge Controller failed to initialize. Please try again.");
        }
        const connectedAccount = await controller.connect();
        if (!isCartridgeWalletAccount(connectedAccount)) {
            throw new Error("Cartridge connection failed. Make sure popups are allowed and try again.");
        }
        const walletAccount = connectedAccount;
        const nodeUrl = assertSafeHttpUrl(options.rpcUrl ?? controller.rpcUrl(), "Cartridge RPC URL").toString();
        const provider = new RpcProvider({ nodeUrl });
        let classHash = "0x0";
        try {
            classHash = await provider.getClassHashAt(fromAddress(walletAccount.address));
        }
        catch {
            // Keep "0x0" for undeployed accounts or unsupported providers.
        }
        const chainId = options.chainId ?? (await getChainId(provider));
        return new CartridgeWallet(controller, walletAccount, provider, chainId, classHash, stakingConfig, options);
    }
    async isDeployed() {
        const now = Date.now();
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
    async ensureReady(options = {}) {
        return ensureWalletReady(this, options);
    }
    async deploy(options = {}) {
        if (options.feeMode !== undefined || options.timeBounds !== undefined) {
            throw new Error("CartridgeWallet.deploy() does not support DeployOptions overrides; deployment mode is controlled by Cartridge Controller.");
        }
        this.clearDeploymentCache();
        // Cartridge Controller handles deployment internally
        const result = await this.controller.keychain?.deploy?.();
        if (!result || result.code !== "SUCCESS" || !result.transaction_hash) {
            throw new Error(result?.message ?? "Cartridge deployment failed");
        }
        return new Tx(result.transaction_hash, this.provider, this.chainId, this.explorerConfig);
    }
    async execute(calls, options = {}) {
        const feeMode = options.feeMode ?? this.defaultFeeMode;
        const timeBounds = options.timeBounds ?? this.defaultTimeBounds;
        let transaction_hash;
        if (feeMode === "sponsored") {
            // Allow provider/controller implementations to handle undeployed accounts
            // atomically via paymaster flow when supported.
            transaction_hash = (await this.walletAccount.executePaymasterTransaction(calls, sponsoredDetails(timeBounds))).transaction_hash;
        }
        else {
            const deployed = await this.isDeployed();
            if (!deployed) {
                throw new Error('Account is not deployed. Call wallet.ensureReady({ deploy: "if_needed" }) before execute() in user_pays mode.');
            }
            transaction_hash = (await this.walletAccount.execute(calls))
                .transaction_hash;
        }
        return new Tx(transaction_hash, this.provider, this.chainId, this.explorerConfig);
    }
    async signMessage(typedData) {
        return this.walletAccount.signMessage(typedData);
    }
    async preflight(options) {
        const feeMode = options.feeMode ?? this.defaultFeeMode;
        return preflightTransaction(this, this.walletAccount, {
            ...options,
            feeMode,
        });
    }
    getAccount() {
        return this.walletAccount;
    }
    getProvider() {
        return this.provider;
    }
    getChainId() {
        return this.chainId;
    }
    getFeeMode() {
        return this.defaultFeeMode;
    }
    getClassHash() {
        return this.classHash;
    }
    async estimateFee(calls) {
        return this.walletAccount.estimateInvokeFee(calls);
    }
    /**
     * Get the Cartridge Controller instance for Cartridge-specific features.
     */
    getController() {
        return this.controller;
    }
    async disconnect() {
        this.clearCaches();
        this.clearDeploymentCache();
        await this.controller.disconnect();
    }
    /**
     * Get the Cartridge username for this wallet.
     */
    async username() {
        return this.controller.username();
    }
}
function isCartridgeWalletAccount(value) {
    if (!value || typeof value !== "object") {
        return false;
    }
    const account = value;
    return (typeof account.address === "string" &&
        typeof account.execute === "function" &&
        typeof account.executePaymasterTransaction === "function" &&
        typeof account.signMessage === "function" &&
        typeof account.simulateTransaction === "function" &&
        typeof account.estimateInvokeFee === "function");
}
//# sourceMappingURL=cartridge.js.map