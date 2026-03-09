import { RpcProvider, type Account, type Call, type PaymasterTimeBounds, type TypedData, type Signature } from "starknet";
import { Tx } from "../tx/index.js";
import { ChainId, type DeployOptions, type EnsureReadyOptions, type ExecuteOptions, type FeeMode, type PreflightOptions, type PreflightResult, type ExplorerConfig, type StakingConfig } from "../types/index.js";
import { BaseWallet } from "../wallet/base.js";
/**
 * Options for connecting with Cartridge Controller.
 */
export interface CartridgeWalletOptions {
    rpcUrl?: string;
    chainId?: ChainId;
    policies?: Array<{
        target: string;
        method: string;
    }>;
    preset?: string;
    url?: string;
    feeMode?: FeeMode;
    timeBounds?: PaymasterTimeBounds;
    explorer?: ExplorerConfig;
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
export declare class CartridgeWallet extends BaseWallet {
    private readonly controller;
    private readonly walletAccount;
    private readonly provider;
    private readonly chainId;
    private readonly classHash;
    private readonly explorerConfig;
    private readonly defaultFeeMode;
    private readonly defaultTimeBounds;
    private deployedCache;
    private deployedCacheExpiresAt;
    private constructor();
    /**
     * Create and connect a CartridgeWallet.
     */
    static create(options?: CartridgeWalletOptions, stakingConfig?: StakingConfig | undefined): Promise<CartridgeWallet>;
    isDeployed(): Promise<boolean>;
    private clearDeploymentCache;
    ensureReady(options?: EnsureReadyOptions): Promise<void>;
    deploy(options?: DeployOptions): Promise<Tx>;
    execute(calls: Call[], options?: ExecuteOptions): Promise<Tx>;
    signMessage(typedData: TypedData): Promise<Signature>;
    preflight(options: PreflightOptions): Promise<PreflightResult>;
    getAccount(): Account;
    getProvider(): RpcProvider;
    getChainId(): ChainId;
    getFeeMode(): FeeMode;
    getClassHash(): string;
    estimateFee(calls: Call[]): Promise<import("starknet").EstimateFeeResponseOverhead>;
    /**
     * Get the Cartridge Controller instance for Cartridge-specific features.
     */
    getController(): unknown;
    disconnect(): Promise<void>;
    /**
     * Get the Cartridge username for this wallet.
     */
    username(): Promise<string | undefined>;
}
//# sourceMappingURL=cartridge.d.ts.map