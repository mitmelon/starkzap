import type { ChainId, Token } from "../types/index.js";
import type { SwapQuote } from "../swap/interface.js";
import { type Call } from "starknet";
export declare const DEFAULT_EKUBO_API_BASE = "https://prod-api-quoter.ekubo.org";
interface EkuboPoolKey {
    token0: string;
    token1: string;
    fee: string;
    tick_spacing: string | number;
    extension: string;
}
interface EkuboRouteStep {
    pool_key: EkuboPoolKey;
    sqrt_ratio_limit: string;
    skip_ahead: string | number;
}
interface EkuboQuoteSplit {
    amount_specified: string;
    amount_calculated: string;
    route: EkuboRouteStep[];
}
export interface EkuboQuoteResponse {
    total_calculated: string;
    price_impact: number | null;
    splits: EkuboQuoteSplit[];
}
export declare function getEkuboErrorMessageFromPayload(payload: unknown): string | null;
export declare function getEkuboQuoterChainId(chainId: ChainId): string;
export declare function parseEkuboQuoteResponse(payload: unknown): EkuboQuoteResponse;
export declare function buildEkuboSwapCalls(params: {
    quote: EkuboQuoteResponse;
    tokenIn: Token;
    tokenOut: Token;
    amountInBase: bigint;
    extensionRouter: string;
    slippageBps?: bigint;
}): Call[];
export declare function toEkuboSwapQuote(params: {
    quote: EkuboQuoteResponse;
    amountInBase: bigint;
    routeCallCount?: number;
}): SwapQuote;
export {};
//# sourceMappingURL=ekubo.helpers.d.ts.map