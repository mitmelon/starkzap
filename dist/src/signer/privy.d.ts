import type { Signature } from "starknet";
import type { SignerInterface } from "../signer/interface.js";
type PrivySigningHeaders = Record<string, string> | (() => Record<string, string> | Promise<Record<string, string>>);
type PrivySigningBody = (params: Readonly<{
    walletId: string;
    hash: string;
}>) => Record<string, unknown> | Promise<Record<string, unknown>>;
/**
 * Configuration for the Privy signer.
 *
 * You can either provide:
 * - `serverUrl`: URL to your backend's sign endpoint (simpler)
 * - `rawSign`: Custom signing function (flexible)
 */
export interface PrivySignerConfig {
    /** Privy wallet ID */
    walletId: string;
    /** Public key returned by Privy when creating the wallet */
    publicKey: string;
    /**
     * URL to your backend's sign endpoint.
     * The signer will POST { walletId, hash } and expect { signature } back.
     * @example "https://my-server.com/api/wallet/sign"
     */
    serverUrl?: string;
    /**
     * Custom function to call Privy's rawSign.
     * Use this for server-side signing with PrivyClient directly.
     */
    rawSign?: (walletId: string, messageHash: string) => Promise<string>;
    /**
     * Optional headers (or header factory) for authenticated signing requests.
     *
     * Use this to pass session/JWT headers when calling your backend endpoint.
     */
    headers?: PrivySigningHeaders;
    /**
     * Optional payload builder for challenge/nonce aware signing endpoints.
     *
     * Default body is `{ walletId, hash }`.
     */
    buildBody?: PrivySigningBody;
    /**
     * Timeout for serverUrl requests in milliseconds.
     * @default 10000
     */
    requestTimeoutMs?: number;
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
export declare class PrivySigner implements SignerInterface {
    private readonly walletId;
    private readonly publicKey;
    private readonly rawSignFn;
    constructor(config: PrivySignerConfig);
    private resolveHeaders;
    private defaultRawSignFn;
    getPubKey(): Promise<string>;
    signRaw(hash: string): Promise<Signature>;
}
export {};
//# sourceMappingURL=privy.d.ts.map