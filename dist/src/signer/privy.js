import { assertSafeHttpUrl } from "../utils/index.js";
/**
 * Parse Privy signature (64-byte hex string) into [r, s] tuple.
 */
function parsePrivySignature(signature) {
    if (typeof signature !== "string" || signature.length === 0) {
        throw new Error("Privy signing failed: empty signature response");
    }
    const sigWithout0x = signature.startsWith("0x")
        ? signature.slice(2)
        : signature;
    if (!/^[0-9a-fA-F]+$/.test(sigWithout0x)) {
        throw new Error("Privy signing failed: signature is not valid hex");
    }
    if (sigWithout0x.length !== 128) {
        throw new Error("Privy signing failed: expected a 64-byte signature (r||s)");
    }
    // Privy returns 64-byte (128 hex char) signature: r (32 bytes) || s (32 bytes)
    const r = "0x" + sigWithout0x.slice(0, 64);
    const s = "0x" + sigWithout0x.slice(64);
    return [r, s];
}
/**
 * Privy-based signer for Starknet.
 *
 * This signer delegates signing to Privy's secure key management.
 * Privy holds the private key and you call their rawSign endpoint.
 *
 * @see https://docs.privy.io/recipes/use-tier-2#starknet
 *
 * @example
 * ```ts
 * // Option 1: Simple - provide your backend URL (recommended for mobile/web)
 * const signer = new PrivySigner({
 *   walletId: wallet.id,
 *   publicKey: wallet.public_key,
 *   serverUrl: "https://my-server.com/api/wallet/sign",
 * });
 *
 * // Option 2: Custom signing function (for server-side with PrivyClient)
 * const signer = new PrivySigner({
 *   walletId: wallet.id,
 *   publicKey: wallet.public_key,
 *   rawSign: async (walletId, messageHash) => {
 *     const response = await privyClient.wallets().rawSign(walletId, {
 *       params: { hash: messageHash }
 *     });
 *     return response.signature;
 *   }
 * });
 *
 * // Use with the SDK
 * const sdk = new StarkZap({ rpcUrl: '...', chainId: ChainId.SEPOLIA });
 * const wallet = await sdk.connectWallet({
 *   account: { signer, accountClass: ArgentPreset }
 * });
 * ```
 */
export class PrivySigner {
    constructor(config) {
        if (!config.serverUrl && !config.rawSign) {
            throw new Error("PrivySigner requires either serverUrl or rawSign");
        }
        this.walletId = config.walletId;
        this.publicKey = config.publicKey;
        // Use provided rawSign or create one from serverUrl
        this.rawSignFn =
            config.rawSign ??
                this.defaultRawSignFn(config.serverUrl, {
                    headers: config.headers,
                    buildBody: config.buildBody,
                    requestTimeoutMs: config.requestTimeoutMs,
                });
    }
    async resolveHeaders(headers) {
        if (!headers) {
            return {};
        }
        return typeof headers === "function" ? await headers() : headers;
    }
    defaultRawSignFn(serverUrl, options) {
        const normalizedUrl = assertSafeHttpUrl(serverUrl, "PrivySigner serverUrl").toString();
        const timeoutMs = options.requestTimeoutMs ?? 10000;
        if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
            throw new Error("PrivySigner requestTimeoutMs must be a positive finite number");
        }
        return async (walletId, hash) => {
            const extraHeaders = await this.resolveHeaders(options.headers);
            const payload = (await options.buildBody?.({ walletId, hash })) ?? {
                walletId,
                hash,
            };
            const controller = typeof AbortController !== "undefined"
                ? new AbortController()
                : undefined;
            const timeoutHandle = controller &&
                setTimeout(() => {
                    controller.abort();
                }, timeoutMs);
            let response;
            try {
                const requestInit = {
                    method: "POST",
                    headers: { "Content-Type": "application/json", ...extraHeaders },
                    body: JSON.stringify(payload),
                };
                if (controller) {
                    requestInit.signal = controller.signal;
                }
                response = await fetch(normalizedUrl, requestInit);
            }
            catch (error) {
                if (error instanceof Error && error.name === "AbortError") {
                    throw new Error(`Privy signing request timed out after ${timeoutMs}ms`);
                }
                throw error;
            }
            finally {
                if (timeoutHandle) {
                    clearTimeout(timeoutHandle);
                }
            }
            let data;
            try {
                data = await response.json();
            }
            catch {
                throw new Error("Privy signing failed: invalid JSON response");
            }
            if (!response.ok) {
                const err = typeof data === "object" && data !== null
                    ? data
                    : {};
                throw new Error((typeof err.details === "string" && err.details) ||
                    (typeof err.error === "string" && err.error) ||
                    "Privy signing failed");
            }
            const signature = typeof data === "object" && data !== null
                ? data.signature
                : undefined;
            if (typeof signature !== "string") {
                throw new Error("Privy signing failed: invalid server response");
            }
            return signature;
        };
    }
    async getPubKey() {
        return this.publicKey;
    }
    async signRaw(hash) {
        const hashWithPrefix = hash.startsWith("0x") ? hash : "0x" + hash;
        const signature = await this.rawSignFn(this.walletId, hashWithPrefix);
        return parsePrivySignature(signature);
    }
}
//# sourceMappingURL=privy.js.map