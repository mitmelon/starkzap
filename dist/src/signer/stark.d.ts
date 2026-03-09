import { type Signature } from "starknet";
import type { SignerInterface } from "../signer/interface.js";
/**
 * Standard Stark curve signer using a private key.
 *
 * @example
 * ```ts
 * const signer = new StarkSigner("0xPRIVATE_KEY");
 * ```
 */
export declare class StarkSigner implements SignerInterface {
    private readonly publicKey;
    private readonly privateKey;
    constructor(privateKey: string);
    getPubKey(): Promise<string>;
    signRaw(hash: string): Promise<Signature>;
}
//# sourceMappingURL=stark.d.ts.map