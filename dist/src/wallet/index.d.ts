import { Account, RpcProvider, type Call, type PaymasterTimeBounds, type TypedData, type Signature } from "starknet";
import { Tx } from "../tx/index.js";
import { AccountProvider } from "../wallet/accounts/provider.js";
import type { SignerInterface } from "../signer/index.js";
import type { Address, AccountClassConfig, DeployOptions, EnsureReadyOptions, ExecuteOptions, FeeMode, PreflightOptions, PreflightResult, SDKConfig, ChainId } from "../types/index.js";
import type { SwapProvider } from "../swap/index.js";
import { BaseWallet } from "../wallet/base.js";
export { type WalletInterface } from "../wallet/interface.js";
export { BaseWallet } from "../wallet/base.js";
export { AccountProvider } from "../wallet/accounts/provider.js";
/**
 * Options for creating a Wallet.
 */
export interface WalletOptions {
    /** Account: either AccountProvider or { signer, accountClass? } */
    account: AccountProvider | {
        signer: SignerInterface;
        accountClass?: AccountClassConfig;
    };
    /** RPC provider */
    provider: RpcProvider;
    /** SDK configuration */
    config: SDKConfig;
    /** Known address (skips address computation if provided) */
    accountAddress?: Address;
    /** Default fee mode (default: "user_pays") */
    feeMode?: FeeMode;
    /** Default time bounds for paymaster transactions */
    timeBounds?: PaymasterTimeBounds;
    /** Optional additional swap providers to register on this wallet */
    swapProviders?: SwapProvider[];
    /** Optional default swap provider id (must be registered) */
    defaultSwapProviderId?: string;
}
export declare class Wallet extends BaseWallet {
    private readonly provider;
    private readonly account;
    private readonly accountProvider;
    private readonly chainId;
    private readonly explorerConfig;
    private readonly defaultFeeMode;
    private readonly defaultTimeBounds;
    /** Cached deployment status (null = not checked yet) */
    private deployedCache;
    private deployedCacheExpiresAt;
    private sponsoredDeployLock;
    private constructor();
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
    static create(options: WalletOptions): Promise<Wallet>;
    isDeployed(): Promise<boolean>;
    private clearDeploymentCache;
    private withSponsoredDeployLock;
    ensureReady(options?: EnsureReadyOptions): Promise<void>;
    deploy(options?: DeployOptions): Promise<Tx>;
    private deployPaymasterWith;
    /**
     * Deploy a Braavos account via the Braavos factory.
     *
     * This works by:
     * 1. Deploying a temporary OZ account (same public key) via paymaster
     * 2. Using that OZ account to call the Braavos factory
     * 3. The factory deploys the Braavos account
     */
    private deployBraavosViaFactory;
    execute(calls: Call[], options?: ExecuteOptions): Promise<Tx>;
    signMessage(typedData: TypedData): Promise<Signature>;
    preflight(options: PreflightOptions): Promise<PreflightResult>;
    getAccount(): Account;
    getProvider(): RpcProvider;
    /**
     * Get the chain ID this wallet is connected to.
     */
    getChainId(): ChainId;
    /**
     * Get the default fee mode for this wallet.
     */
    getFeeMode(): FeeMode;
    /**
     * Get the account class hash.
     */
    getClassHash(): string;
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
    estimateFee(calls: Call[]): Promise<import("starknet").EstimateFeeResponseOverhead>;
    disconnect(): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map