import type { ChainId } from "../types/index.js";
import type { PreparedSwap, SwapProvider, SwapQuote, SwapRequest } from "../swap/interface.js";
export interface AvnuSwapProviderOptions {
    /** Optional API base override per chain. */
    apiBases?: Partial<Record<"SN_MAIN" | "SN_SEPOLIA", string[]>>;
    /** Optional max quotes requested from AVNU quote API. */
    quotesPageSize?: number;
}
export declare class AvnuSwapProvider implements SwapProvider {
    readonly id = "avnu";
    private readonly apiBases;
    private readonly quotesPageSize;
    constructor(options?: AvnuSwapProviderOptions);
    supportsChain(chainId: ChainId): boolean;
    getQuote(request: SwapRequest): Promise<SwapQuote>;
    swap(request: SwapRequest): Promise<PreparedSwap>;
    private getApiBases;
    private fetchQuoteForRequest;
    private fetchQuote;
}
//# sourceMappingURL=avnu.d.ts.map