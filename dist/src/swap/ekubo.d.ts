import { type Address, type ChainId } from "../types/index.js";
import type { PreparedSwap, SwapProvider, SwapQuote, SwapRequest } from "../swap/interface.js";
/**
 * Ekubo extension router configuration.
 */
export interface EkuboSwapConfig {
    /** Ekubo router contract used as swap target */
    extensionRouter: Address;
}
/**
 * Chain-aware Ekubo presets.
 *
 * Source: https://docs.ekubo.org/integration-guides/reference/smart-contracts/starknet-contracts
 */
export declare const ekuboPresets: {
    readonly SN_MAIN: {
        readonly extensionRouter: Address;
    };
    readonly SN_SEPOLIA: {
        readonly extensionRouter: Address;
    };
};
/**
 * Get Ekubo preset configuration for the target chain.
 */
export declare function getEkuboPreset(chainId: ChainId): EkuboSwapConfig;
export interface EkuboSwapProviderOptions {
    /** Optional Ekubo quoter base URL override. */
    apiBase?: string;
    /** Optional fetch implementation override for custom runtimes/tests. */
    fetcher?: typeof fetch;
}
export declare class EkuboSwapProvider implements SwapProvider {
    readonly id = "ekubo";
    private readonly apiBase;
    private readonly fetcher;
    constructor(options?: EkuboSwapProviderOptions);
    supportsChain(chainId: ChainId): boolean;
    getQuote(request: SwapRequest): Promise<SwapQuote>;
    swap(request: SwapRequest): Promise<PreparedSwap>;
    private fetchQuoteForRequest;
    private fetchQuote;
}
//# sourceMappingURL=ekubo.d.ts.map