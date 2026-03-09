import type { Address, ChainId } from "../types/index.js";
import type { SwapInput, SwapProvider, SwapRequest } from "../swap/interface.js";
export declare function resolveSwapSource(source: SwapProvider | string | undefined, resolver: {
    getDefaultSwapProvider(): SwapProvider;
    getSwapProvider(providerId: string): SwapProvider;
}): SwapProvider;
export declare function hydrateSwapRequest(input: SwapInput, walletContext: {
    chainId: ChainId;
    takerAddress: Address;
}): SwapRequest;
export declare function assertSwapContext(provider: SwapProvider, request: SwapRequest, walletChainId: ChainId): void;
export declare function resolveSwapInput(input: SwapInput, context: {
    walletChainId: ChainId;
    takerAddress: Address;
    providerResolver: {
        getDefaultSwapProvider(): SwapProvider;
        getSwapProvider(providerId: string): SwapProvider;
    };
}): {
    provider: SwapProvider;
    request: SwapRequest;
};
//# sourceMappingURL=utils.d.ts.map