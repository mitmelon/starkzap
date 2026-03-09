import { RpcProvider, TransactionExecutionStatus, TransactionFinalityStatus, } from "starknet";
import { ChainId } from "../types/index.js";
import { assertSafeHttpUrl } from "../utils/index.js";
const DEFAULT_POLL_INTERVAL_MS = 5000;
const DEFAULT_WATCH_TIMEOUT_MS = 10 * 60000;
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
export class Tx {
    constructor(hash, provider, chainId, explorerConfig) {
        this.cachedReceipt = null;
        this.hash = hash;
        this.provider = provider;
        this.explorerUrl = buildExplorerUrl(hash, chainId, explorerConfig);
    }
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
    async wait(options) {
        await this.provider.waitForTransaction(this.hash, {
            successStates: [
                TransactionFinalityStatus.ACCEPTED_ON_L2,
                TransactionFinalityStatus.ACCEPTED_ON_L1,
            ],
            errorStates: [TransactionExecutionStatus.REVERTED],
            retryInterval: DEFAULT_POLL_INTERVAL_MS,
            ...options,
        });
    }
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
    watch(callback, options = {}) {
        let stopped = false;
        let lastFinality = null;
        const pollIntervalMs = options.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS;
        const timeoutMs = options.timeoutMs ?? DEFAULT_WATCH_TIMEOUT_MS;
        if (!Number.isFinite(pollIntervalMs) || pollIntervalMs <= 0) {
            throw new Error("tx.watch pollIntervalMs must be a positive number");
        }
        if (!Number.isFinite(timeoutMs) || timeoutMs < 0) {
            throw new Error("tx.watch timeoutMs must be >= 0");
        }
        const startedAt = Date.now();
        const poll = async () => {
            while (!stopped) {
                if (timeoutMs > 0 && Date.now() - startedAt >= timeoutMs) {
                    const err = new Error(`Transaction watch timed out after ${timeoutMs}ms for ${this.hash}`);
                    options.onError?.(err);
                    stopped = true;
                    return;
                }
                try {
                    const result = await this.provider.getTransactionStatus(this.hash);
                    const finality = result.finality_status;
                    const execution = result.execution_status;
                    if (finality && finality !== lastFinality) {
                        lastFinality = finality;
                        callback({ finality, execution });
                    }
                    if (isFinalStatus(finality, execution)) {
                        stopped = true;
                        return;
                    }
                }
                catch (error) {
                    options.onError?.(error instanceof Error
                        ? error
                        : new Error("Failed to poll transaction status"));
                }
                await sleep(pollIntervalMs);
            }
        };
        void poll();
        return () => {
            stopped = true;
        };
    }
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
    async receipt() {
        if (this.cachedReceipt) {
            return this.cachedReceipt;
        }
        const receipt = await this.provider.getTransactionReceipt(this.hash);
        if (isFinalReceipt(receipt)) {
            this.cachedReceipt = receipt;
        }
        return receipt;
    }
}
// ─── Helpers ─────────────────────────────────────────────────────────────────
function buildExplorerUrl(hash, chainId, config) {
    const encodedHash = encodeURIComponent(hash);
    if (config?.baseUrl) {
        const baseUrl = assertSafeHttpUrl(config.baseUrl, "explorer.baseUrl");
        const normalizedBaseUrl = new URL(baseUrl.toString());
        if (!normalizedBaseUrl.pathname.endsWith("/")) {
            normalizedBaseUrl.pathname = `${normalizedBaseUrl.pathname}/`;
        }
        return new URL(`tx/${encodedHash}`, normalizedBaseUrl).toString();
    }
    const isMainnet = chainId.isMainnet();
    const explorerProvider = config?.provider ?? "voyager";
    if (explorerProvider === "starkscan") {
        const subdomain = isMainnet ? "" : "sepolia.";
        return `https://${subdomain}starkscan.co/tx/${encodedHash}`;
    }
    // Default: voyager
    const subdomain = isMainnet ? "" : "sepolia.";
    return `https://${subdomain}voyager.online/tx/${encodedHash}`;
}
function isFinalStatus(finality, execution) {
    if (execution === TransactionExecutionStatus.REVERTED) {
        return true;
    }
    return (finality === TransactionFinalityStatus.ACCEPTED_ON_L2 ||
        finality === TransactionFinalityStatus.ACCEPTED_ON_L1);
}
function isFinalReceipt(receipt) {
    const value = receipt;
    return isFinalStatus(value.finality_status, value.execution_status);
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
export { TxBuilder } from "../tx/builder.js";
//# sourceMappingURL=index.js.map