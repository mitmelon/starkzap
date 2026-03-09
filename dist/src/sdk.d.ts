import { RpcProvider, type Call, type PaymasterTimeBounds } from "starknet";
import { type SDKConfig } from "./types/config.js";
import type { ConnectWalletOptions, FeeMode } from "./types/wallet.js";
import { Wallet } from "./wallet/index.js";
import type { WalletInterface } from "./wallet/interface.js";
import type { Address, Token, Pool } from "./types/index.js";
import type { OnboardCartridgeConfig, OnboardOptions, OnboardResult } from "./types/index.js";
export interface ConnectCartridgeBaseOptions {
    feeMode?: FeeMode;
    timeBounds?: PaymasterTimeBounds;
}
export type ConnectCartridgeOptions = OnboardCartridgeConfig & ConnectCartridgeBaseOptions;
export interface CartridgeWalletInterface extends WalletInterface {
    getController(): unknown;
    username(): Promise<string | undefined>;
}
/**
 * Main SDK class for Starknet wallet integration.
 *
 * @example
 * ```ts
 * import { StarkZap, StarkSigner, ArgentPreset } from "starkzap";
 *
 * // Using network presets (recommended)
 * const sdk = new StarkZap({ network: "mainnet" });
 * const sdk = new StarkZap({ network: "sepolia" });
 *
 * // Or with custom RPC
 * const sdk = new StarkZap({
 *   rpcUrl: "https://my-rpc.example.com",
 *   chainId: ChainId.MAINNET,
 * });
 *
 * // Connect with default account (OpenZeppelin)
 * const wallet = await sdk.connectWallet({
 *   account: { signer: new StarkSigner(privateKey) },
 * });
 *
 * // Use the wallet
 * await wallet.ensureReady({ deploy: "if_needed" });
 * const tx = await wallet.execute([...]);
 * await tx.wait();
 * ```
 */
export declare class StarkZap {
    private readonly config;
    private readonly provider;
    private chainValidationPromise;
    constructor(config: SDKConfig);
    private resolveConfig;
    private getStakingConfig;
    private ensureProviderChainMatchesConfig;
    /**
     * Connect a wallet using the specified signer and account configuration.
     *
     * @example
     * ```ts
     * import { StarkSigner, OpenZeppelinPreset, ArgentPreset } from "starkzap";
     *
     * // Default: OpenZeppelin account
     * const wallet = await sdk.connectWallet({
     *   account: { signer: new StarkSigner(privateKey) },
     * });
     *
     * // With Argent preset
     * const wallet = await sdk.connectWallet({
     *   account: {
     *     signer: new StarkSigner(privateKey),
     *     accountClass: ArgentPreset,
     *   },
     * });
     *
     * // With custom account class
     * const wallet = await sdk.connectWallet({
     *   account: {
     *     signer: new StarkSigner(privateKey),
     *     accountClass: {
     *       classHash: "0x...",
     *       buildConstructorCalldata: (pk) => [pk, "0x0"],
     *     },
     *   },
     * });
     *
     * // With sponsored transactions
     * const wallet = await sdk.connectWallet({
     *   account: { signer: new StarkSigner(privateKey) },
     *   feeMode: "sponsored",
     * });
     * ```
     */
    connectWallet(options: ConnectWalletOptions): Promise<Wallet>;
    private resolveAccountPreset;
    /**
     * High-level onboarding API for app integrations.
     *
     * Strategy behaviors:
     * - `signer`: connect with a provided signer/account config
     * - `privy`: resolve Privy auth context, then connect via PrivySigner
     * - `cartridge`: connect via Cartridge Controller
     *
     * By default, onboarding calls `wallet.ensureReady({ deploy: "if_needed" })`.
     */
    onboard(options: OnboardOptions): Promise<OnboardResult>;
    /**
     * Connect using Cartridge Controller.
     *
     * Opens the Cartridge authentication popup for social login or passkeys.
     * Returns a CartridgeWallet that implements WalletInterface.
     *
     * @example
     * ```ts
     * const wallet = await sdk.connectCartridge({
     *   policies: [
     *     { target: "0xCONTRACT", method: "transfer" }
     *   ]
     * });
     *
     * // Use just like any other wallet
     * await wallet.execute([...]);
     *
     * // Access Cartridge-specific features
     * const controller = wallet.getController();
     * controller.openProfile();
     * ```
     */
    connectCartridge(options?: ConnectCartridgeOptions): Promise<CartridgeWalletInterface>;
    /**
     * Get all tokens that are currently enabled for staking.
     *
     * Returns the list of tokens that can be staked in the protocol.
     * Typically includes STRK and may include other tokens.
     *
     * @returns Array of tokens that can be staked
     * @throws Error if staking is not configured in the SDK config
     *
     * @example
     * ```ts
     * const tokens = await sdk.stakingTokens();
     * console.log(`Stakeable tokens: ${tokens.map(t => t.symbol).join(', ')}`);
     * // Output: "Stakeable tokens: STRK, BTC"
     * ```
     */
    stakingTokens(): Promise<Token[]>;
    /**
     * Get all delegation pools managed by a specific validator.
     *
     * Validators can have multiple pools, one for each supported token.
     * Use this to discover what pools a validator offers and their current
     * delegation amounts.
     *
     * @param staker - The validator's staker address
     * @returns Array of pools with their contract addresses, tokens, and amounts
     * @throws Error if staking is not configured in the SDK config
     *
     * @example
     * ```ts
     * const pools = await sdk.getStakerPools(validatorAddress);
     * for (const pool of pools) {
     *   console.log(`${pool.token.symbol}: ${pool.amount.toFormatted()} delegated`);
     * }
     * ```
     */
    getStakerPools(staker: Address): Promise<Pool[]>;
    /**
     * Get the underlying RPC provider.
     */
    getProvider(): RpcProvider;
    /**
     * Call a read-only contract entrypoint using the SDK provider.
     *
     * This executes an RPC `call` without sending a transaction.
     * Useful before wallet connection or for app-level reads.
     */
    callContract(call: Call): ReturnType<RpcProvider["callContract"]>;
}
//# sourceMappingURL=sdk.d.ts.map