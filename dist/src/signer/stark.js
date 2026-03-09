import { ec } from "starknet";
/**
 * Standard Stark curve signer using a private key.
 *
 * @example
 * ```ts
 * const signer = new StarkSigner("0xPRIVATE_KEY");
 * ```
 */
export class StarkSigner {
    constructor(privateKey) {
        this.privateKey = privateKey;
        this.publicKey = ec.starkCurve.getStarkKey(privateKey);
    }
    async getPubKey() {
        return this.publicKey;
    }
    async signRaw(hash) {
        const signature = ec.starkCurve.sign(hash, this.privateKey);
        return ["0x" + signature.r.toString(16), "0x" + signature.s.toString(16)];
    }
}
//# sourceMappingURL=stark.js.map