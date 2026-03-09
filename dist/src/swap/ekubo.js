import { fromAddress } from "../types/index.js";
import { buildEkuboSwapCalls, DEFAULT_EKUBO_API_BASE, getEkuboErrorMessageFromPayload, getEkuboQuoterChainId, parseEkuboQuoteResponse, toEkuboSwapQuote, } from "../swap/ekubo.helpers";
/**
 * Chain-aware Ekubo presets.
 *
 * Source: https://docs.ekubo.org/integration-guides/reference/smart-contracts/starknet-contracts
 */
export const ekuboPresets = {
    SN_MAIN: {
        extensionRouter: fromAddress("0x0199741822c2dc722f6f605204f35e56dbc23bceed54818168c4c49e4fb8737e"),
    },
    SN_SEPOLIA: {
        extensionRouter: fromAddress("0x0045f933adf0607292468ad1c1dedaa74d5ad166392590e72676a34d01d7b763"),
    },
};
/**
 * Get Ekubo preset configuration for the target chain.
 */
export function getEkuboPreset(chainId) {
    const literal = chainId.toLiteral();
    if (literal === "SN_MAIN") {
        return ekuboPresets.SN_MAIN;
    }
    if (literal === "SN_SEPOLIA") {
        return ekuboPresets.SN_SEPOLIA;
    }
    throw new Error(`Unsupported chain for Ekubo config: ${literal}`);
}
export class EkuboSwapProvider {
    constructor(options = {}) {
        this.id = "ekubo";
        this.apiBase = options.apiBase ?? DEFAULT_EKUBO_API_BASE;
        this.fetcher = options.fetcher ?? fetch;
    }
    supportsChain(chainId) {
        const literal = chainId.toLiteral();
        return literal === "SN_MAIN" || literal === "SN_SEPOLIA";
    }
    async getQuote(request) {
        const { quote, amountInBase } = await this.fetchQuoteForRequest(request);
        return toEkuboSwapQuote({ quote, amountInBase });
    }
    async swap(request) {
        const { quote, amountInBase } = await this.fetchQuoteForRequest(request);
        const preset = getEkuboPreset(request.chainId);
        const calls = buildEkuboSwapCalls({
            quote,
            tokenIn: request.tokenIn,
            tokenOut: request.tokenOut,
            amountInBase,
            extensionRouter: preset.extensionRouter,
            ...(request.slippageBps != null && { slippageBps: request.slippageBps }),
        });
        return {
            calls,
            quote: toEkuboSwapQuote({
                quote,
                amountInBase,
                routeCallCount: calls.length,
            }),
        };
    }
    async fetchQuoteForRequest(request) {
        const amountInBase = request.amountIn.toBase();
        const quote = await this.fetchQuote({
            chainId: request.chainId,
            amountInBase,
            tokenInAddress: request.tokenIn.address,
            tokenOutAddress: request.tokenOut.address,
        });
        return { quote, amountInBase };
    }
    async fetchQuote(params) {
        const chainId = getEkuboQuoterChainId(params.chainId);
        const url = `${this.apiBase}/${chainId}/${params.amountInBase.toString()}/${params.tokenInAddress}/${params.tokenOutAddress}`;
        const response = await this.fetcher(url);
        let payload = null;
        try {
            payload = await response.json();
        }
        catch {
            if (!response.ok) {
                throw new Error(`Ekubo quote failed (${response.status})`);
            }
            throw new Error("Ekubo quote returned a non-JSON response");
        }
        if (!response.ok) {
            const responseError = getEkuboErrorMessageFromPayload(payload);
            throw new Error(responseError ?? `Ekubo quote failed (${response.status})`);
        }
        return parseEkuboQuoteResponse(payload);
    }
}
//# sourceMappingURL=ekubo.js.map