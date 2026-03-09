import { RpcProvider } from "starknet";
import type { TxReceipt, TxUnsubscribe, TxWatchCallback, TxWatchOptions, WaitOptions, ExplorerConfig } from "../types/index.js";
import { ChainId } from "../types/index.js";
/**
 * Represents a submitted Starknet transaction.
 * Provides methods to wait for confirmation, watch status changes, and get receipts.
 *
 * @example
 * ```ts
 * const tx = await wallet.execute(calls);
 * console.log(tx.explorerUrl);
 *
 * // Wait for L2 acceptance
 * await tx.wait({
 *   successStates: [TransactionFinalityStatus.ACCEPTED_ON_L2],
 * });
 *
 * const receipt = await tx.receipt();
 * ```
 */
export declare class Tx {
    /** Transaction hash */
    readonly hash: string;
    /** URL to view transaction on block explorer */
    readonly explorerUrl: string;
    private readonly provider;
    private cachedReceipt;
    constructor(hash: string, provider: RpcProvider, chainId: ChainId, explorerConfig?: ExplorerConfig);
    /**
     * Wait for the transaction to reach a target status.
     * Wraps starknet.js `waitForTransaction`.
     *
     * @param options - Optional overrides for success/error states and retry interval
     * @throws Error if transaction is reverted or reaches an error state
     *
     * @example
     * ```ts
     * // Wait for L2 acceptance (default)
     * await tx.wait();
     *
     * // Wait for L1 finality
     * await tx.wait({
     *   successStates: [TransactionFinalityStatus.ACCEPTED_ON_L1],
     * });
     * ```
     */
    wait(options?: WaitOptions): Promise<void>;
    /**
     * Watch transaction status changes in real-time.
     *
     * Polls the transaction status and calls the callback whenever the
     * finality status changes. Automatically stops when the transaction
     * reaches a final state (accepted or reverted).
     *
     * @param callback - Called on each status change with `{ finality, execution }`
     * @returns Unsubscribe function — call it to stop watching early
     *
     * @example
     * ```ts
     * const unsubscribe = tx.watch(({ finality, execution }) => {
     *   console.log(`Status: ${finality} (${execution})`);
     * });
     *
     * // Stop watching early if needed
     * unsubscribe();
     * ```
     */
    watch(callback: TxWatchCallback, options?: TxWatchOptions): TxUnsubscribe;
    /**
     * Get the full transaction receipt.
     *
     * The result is cached after the first successful fetch, so subsequent
     * calls return immediately without an RPC round-trip.
     *
     * @returns The transaction receipt
     *
     * @example
     * ```ts
     * await tx.wait();
     * const receipt = await tx.receipt();
     * console.log("Fee paid:", receipt.actual_fee);
     * ```
     */
    receipt(): Promise<TxReceipt>;
}
export { TxBuilder } from "../tx/builder.js";
//# sourceMappingURL=index.d.ts.map