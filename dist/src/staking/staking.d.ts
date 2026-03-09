import { type Call, type RpcProvider } from "starknet";
import { type Address, Amount, type ExecuteOptions, type StakingConfig, type Token } from "../types/index.js";
import type { WalletInterface } from "../wallet/index.js";
import type { Tx } from "../tx/index.js";
import type { Pool, PoolMember } from "../types/pool.js";
interface FromPoolOptions {
    timeoutMs?: number;
    signal?: AbortSignal;
}
/**
 * Represents a staking delegation pool and provides methods to interact with it.
 *
 * The Staking class allows delegators to:
 * - Enter and exit delegation pools
 * - Add to existing stakes
 * - Claim rewards
 * - Query pool information and APY
 *
 * @example
 * ```ts
 * // Get a staking instance for a specific validator
 * const staking = await Staking.fromStaker(validatorAddress, strkToken, provider, config);
 *
 * // Enter the pool
 * const tx = await staking.enter(wallet, Amount.parse(100, strkToken));
 * await tx.wait();
 *
 * // Check your position
 * const position = await staking.getPosition(wallet);
 * if (position) {
 *   console.log(`Staked: ${position.staked.toFormatted()}`);
 * }
 * ```
 */
export declare class Staking {
    private readonly pool;
    private readonly token;
    private readonly provider;
    private constructor();
    /**
     * Ensure an Amount matches this pool token's decimals and symbol.
     */
    private assertAmountMatchesToken;
    /**
     * The pool contract address for this staking instance.
     *
     * @returns The Starknet address of the delegation pool contract
     */
    get poolAddress(): Address;
    /**
     * Build approve + enter pool Calls without executing.
     *
     * @internal Used by {@link TxBuilder} — not part of the public API.
     */
    populateEnter(walletAddress: Address, amount: Amount): Call[];
    /**
     * Enter the delegation pool as a new member.
     *
     * This will approve the token transfer and stake the specified amount in the pool.
     * The wallet must not already be a member of this pool.
     *
     * @param wallet - The wallet to stake from
     * @param amount - The amount of tokens to stake
     * @param options - Optional execution options (e.g., gas settings)
     * @returns A transaction object that can be awaited for confirmation
     * @throws Error if the wallet is already a member of the pool
     *
     * @example
     * ```ts
     * const tx = await staking.enter(wallet, Amount.parse(100, strkToken));
     * await tx.wait();
     * ```
     */
    enter(wallet: WalletInterface, amount: Amount, options?: ExecuteOptions): Promise<Tx>;
    /**
     * Stake tokens in this pool, automatically choosing enter or add.
     *
     * - If the wallet is not yet a member, this performs `enter()`.
     * - If the wallet is already a member, this performs `add()`.
     *
     * This is the recommended high-level staking method for most app flows.
     *
     * @param wallet - The wallet to stake from
     * @param amount - The amount of tokens to stake
     * @param options - Optional execution options
     * @returns A transaction object that can be awaited for confirmation
     *
     * @example
     * ```ts
     * const tx = await staking.stake(wallet, Amount.parse(100, strkToken));
     * await tx.wait();
     * ```
     */
    stake(wallet: WalletInterface, amount: Amount, options?: ExecuteOptions): Promise<Tx>;
    /**
     * Check if a wallet is a member of this delegation pool.
     *
     * @param wallet - The wallet to check
     * @returns True if the wallet is a pool member, false otherwise
     */
    isMember(wallet: WalletInterface): Promise<boolean>;
    /**
     * Get the current staking position for a wallet in this pool.
     *
     * Returns detailed information about the delegator's stake including:
     * - Staked amount
     * - Unclaimed rewards
     * - Exit/unpooling status
     * - Commission rate
     *
     * @param wallet - The wallet to query
     * @returns The pool member position, or null if not a member
     *
     * @example
     * ```ts
     * const position = await staking.getPosition(wallet);
     * if (position) {
     *   console.log(`Staked: ${position.staked.toFormatted()}`);
     *   console.log(`Rewards: ${position.rewards.toFormatted()}`);
     * }
     * ```
     */
    getPosition(wallet: WalletInterface): Promise<PoolMember | null>;
    /**
     * Get the validator's commission rate for this pool.
     *
     * The commission is the percentage of rewards that the validator takes
     * before distributing to delegators.
     *
     * @returns The commission as a percentage (e.g., 10 means 10%)
     *
     * @example
     * ```ts
     * const commission = await staking.getCommission();
     * console.log(`Validator commission: ${commission}%`);
     * ```
     */
    getCommission(): Promise<number>;
    /**
     * Build approve + add-to-pool Calls without executing.
     *
     * @internal Used by {@link TxBuilder} — not part of the public API.
     */
    populateAdd(walletAddress: Address, amount: Amount): Call[];
    /**
     * Add more tokens to an existing stake in the pool.
     *
     * The wallet must already be a member of the pool. Use `enter()` for first-time staking.
     *
     * @param wallet - The wallet to add stake from
     * @param amount - The amount of tokens to add
     * @param options - Optional execution options
     * @returns A transaction object that can be awaited for confirmation
     * @throws Error if the wallet is not a member of the pool
     *
     * @example
     * ```ts
     * const tx = await staking.add(wallet, Amount.parse(50, strkToken));
     * await tx.wait();
     * ```
     */
    add(wallet: WalletInterface, amount: Amount, options?: ExecuteOptions): Promise<Tx>;
    /**
     * Build a claim-rewards Call without executing.
     *
     * @internal Used by {@link TxBuilder} — not part of the public API.
     */
    populateClaimRewards(walletAddress: Address): Call;
    /**
     * Claim accumulated staking rewards.
     *
     * Transfers all unclaimed rewards to the wallet's reward address.
     * The caller must be the reward address for this pool member.
     *
     * @param wallet - The wallet to claim rewards for
     * @param options - Optional execution options
     * @returns A transaction object that can be awaited for confirmation
     * @throws Error if the wallet is not a member of the pool
     * @throws Error if the caller is not the reward address for this member
     * @throws Error if there are no rewards to claim
     *
     * @example
     * ```ts
     * const position = await staking.getPosition(wallet);
     * if (position && !position.rewards.isZero()) {
     *   const tx = await staking.claimRewards(wallet);
     *   await tx.wait();
     * }
     * ```
     */
    claimRewards(wallet: WalletInterface, options?: ExecuteOptions): Promise<Tx>;
    /**
     * Build an exit-intent Call without executing.
     *
     * @internal Used by {@link TxBuilder} — not part of the public API.
     */
    populateExitIntent(amount: Amount): Call;
    /**
     * Initiate an exit from the delegation pool.
     *
     * This starts the unstaking process by declaring intent to withdraw.
     * After calling this, you must wait for the exit window to pass before
     * calling `exit()` to complete the withdrawal.
     *
     * The specified amount will stop earning rewards immediately and will
     * be locked until the exit window completes.
     *
     * @param wallet - The wallet to exit from the pool
     * @param amount - The amount to unstake
     * @param options - Optional execution options
     * @returns A transaction object that can be awaited for confirmation
     * @throws Error if the wallet is not a member of the pool
     * @throws Error if the wallet already has a pending exit
     * @throws Error if the requested amount exceeds the staked balance
     *
     * @example
     * ```ts
     * // Step 1: Declare exit intent
     * const exitTx = await staking.exitIntent(wallet, Amount.parse(50, strkToken));
     * await exitTx.wait();
     *
     * // Step 2: Wait for exit window (check position.unpoolTime)
     * const position = await staking.getPosition(wallet);
     * console.log(`Can exit after: ${position?.unpoolTime}`);
     *
     * // Step 3: Complete exit after window passes
     * const completeTx = await staking.exit(wallet);
     * await completeTx.wait();
     * ```
     */
    exitIntent(wallet: WalletInterface, amount: Amount, options?: ExecuteOptions): Promise<Tx>;
    /**
     * Build an exit-pool Call without executing.
     *
     * @internal Used by {@link TxBuilder} — not part of the public API.
     */
    populateExit(walletAddress: Address): Call;
    /**
     * Complete the exit from the delegation pool.
     *
     * This finalizes the unstaking process and transfers the tokens back to the wallet.
     * Can only be called after the exit window has passed following an `exitIntent()` call.
     *
     * @param wallet - The wallet completing the exit
     * @param options - Optional execution options
     * @returns A transaction object that can be awaited for confirmation
     * @throws Error if no exit intent exists or the exit window hasn't passed
     *
     * @example
     * ```ts
     * const position = await staking.getPosition(wallet);
     * if (position?.unpoolTime && new Date() >= position.unpoolTime) {
     *   const tx = await staking.exit(wallet);
     *   await tx.wait();
     * }
     * ```
     */
    exit(wallet: WalletInterface, options?: ExecuteOptions): Promise<Tx>;
    /**
     * Creates a typed ERC20 contract instance for the staking token.
     *
     * @param providerOrAccount - The provider or account to use for contract calls
     * @returns A typed ERC20 contract instance
     */
    private tokenContract;
    /**
     * Asserts that a wallet is a member of this pool and returns its position.
     *
     * @param wallet - The wallet to check
     * @returns The pool member position
     * @throws Error if the wallet is not a member of the pool
     */
    private assertIsMember;
    /**
     * Create a Staking instance from a known pool contract address.
     *
     * Use this when you know the specific pool contract address you want to interact with.
     *
     * @param poolAddress - The pool contract address
     * @param provider - The RPC provider
     * @param config - The staking configuration
     * @returns A Staking instance for the specified pool
     * @throws Error if the pool doesn't exist or token cannot be resolved
     *
     * @example
     * ```ts
     * const staking = await Staking.fromPool(
     *   poolAddress,
     *   provider,
     *   config.staking
     * );
     * ```
     */
    static fromPool(poolAddress: Address, provider: RpcProvider, config: StakingConfig, options?: FromPoolOptions): Promise<Staking>;
    /**
     * Create a Staking instance from a validator's (staker's) address.
     *
     * This is the most common way to get a Staking instance when you want to
     * delegate to a specific validator. The method finds the pool for the
     * specified token managed by this validator.
     *
     * @param stakerAddress - The validator's staker address
     * @param token - The token to stake (e.g., STRK)
     * @param provider - The RPC provider
     * @param config - The staking configuration
     * @returns A Staking instance for the validator's pool
     * @throws Error if the validator doesn't have a pool for the specified token
     *
     * @example
     * ```ts
     * const staking = await Staking.fromStaker(
     *   validatorAddress,
     *   strkToken,
     *   provider,
     *   config.staking
     * );
     * ```
     */
    static fromStaker(stakerAddress: Address, token: Token, provider: RpcProvider, config: StakingConfig): Promise<Staking>;
    /**
     * Get all tokens that are currently enabled for staking.
     *
     * Returns the list of tokens that can be staked in the protocol.
     * Typically, includes STRK and may include other tokens like wrapped BTC.
     *
     * @param provider - The RPC provider
     * @param config - The staking configuration
     * @returns Array of tokens that can be staked
     *
     * @example
     * ```ts
     * const tokens = await Staking.activeTokens(provider, config.staking);
     * console.log(`Stakeable tokens: ${tokens.map(t => t.symbol).join(', ')}`);
     * ```
     */
    static activeTokens(provider: RpcProvider, config: StakingConfig): Promise<Token[]>;
    /**
     * Get all delegation pools managed by a specific validator.
     *
     * Validators can have multiple pools, one for each supported token.
     * This method returns information about each pool including the
     * pool contract address, token, and total delegated amount.
     *
     * @param provider - The RPC provider
     * @param stakerAddress - The validator's staker address
     * @param config - The staking configuration
     * @returns Array of pools managed by the validator
     *
     * @example
     * ```ts
     * const pools = await Staking.getStakerPools(provider, validatorAddress, config.staking);
     * for (const pool of pools) {
     *   console.log(`${pool.token.symbol} pool: ${pool.amount.toFormatted()} delegated`);
     * }
     * ```
     */
    static getStakerPools(provider: RpcProvider, stakerAddress: Address, config: StakingConfig): Promise<Pool[]>;
}
export {};
//# sourceMappingURL=staking.d.ts.map