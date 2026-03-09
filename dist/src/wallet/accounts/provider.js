import { hash, num } from "starknet";
import { OpenZeppelinPreset } from "../../account/index.js";
import { fromAddress } from "../../types/index.js";
/** Ensure value is a 0x-prefixed hex string */
function toHex(value) {
    if (typeof value === "string" && value.startsWith("0x")) {
        return value;
    }
    return num.toHex(value);
}
/**
 * Account provider that combines a signer with an account class configuration.
 *
 * Computes and caches the Starknet address from the signer's public key
 * and the account class constructor. This is the bridge between a
 * {@link SignerInterface} and a deployed (or counterfactual) account contract.
 *
 * @example
 * ```ts
 * import { AccountProvider, StarkSigner, ArgentPreset } from "starkzap";
 *
 * const provider = new AccountProvider(
 *   new StarkSigner(privateKey),
 *   ArgentPreset
 * );
 *
 * const address = await provider.getAddress();
 * const publicKey = await provider.getPublicKey();
 * ```
 */
export class AccountProvider {
    /**
     * @param signer - The signer implementation for signing operations
     * @param accountClass - Account class configuration (default: {@link OpenZeppelinPreset})
     */
    constructor(signer, accountClass) {
        this.cachedPublicKey = null;
        this.cachedAddress = null;
        this.signer = signer;
        this.accountClass = accountClass ?? OpenZeppelinPreset;
    }
    /**
     * Compute and return the counterfactual address for this account.
     *
     * The address is derived from the signer's public key, the account class
     * hash, and the constructor calldata. Cached after first computation.
     *
     * @returns The Starknet address for this account
     */
    async getAddress() {
        if (this.cachedAddress) {
            return this.cachedAddress;
        }
        const publicKey = await this.getPublicKey();
        const calldata = this.getConstructorCalldata(publicKey);
        const salt = this.getSalt(publicKey);
        const addressStr = hash.calculateContractAddressFromHash(salt, this.accountClass.classHash, calldata, 0 // deployer address (0 for counterfactual)
        );
        this.cachedAddress = fromAddress(addressStr);
        return this.cachedAddress;
    }
    /**
     * Get the public key from the underlying signer. Cached after first call.
     * @returns The public key as a hex string
     */
    async getPublicKey() {
        if (this.cachedPublicKey) {
            return this.cachedPublicKey;
        }
        const pubKey = await this.signer.getPubKey();
        this.cachedPublicKey = pubKey;
        return pubKey;
    }
    /** Get the underlying signer instance. */
    getSigner() {
        return this.signer;
    }
    /** Get the account contract class hash. */
    getClassHash() {
        return this.accountClass.classHash;
    }
    /** Build the constructor calldata from the given public key. */
    getConstructorCalldata(publicKey) {
        return this.accountClass.buildConstructorCalldata(publicKey);
    }
    /** Compute the address salt from the given public key. */
    getSalt(publicKey) {
        return this.accountClass.getSalt
            ? this.accountClass.getSalt(publicKey)
            : publicKey;
    }
    /**
     * Get deployment data for paymaster-sponsored deployment.
     */
    async getDeploymentData() {
        const publicKey = await this.getPublicKey();
        const address = await this.getAddress();
        const calldata = this.getConstructorCalldata(publicKey);
        const salt = this.getSalt(publicKey);
        return {
            address: toHex(address.toString()),
            class_hash: toHex(this.accountClass.classHash),
            salt: toHex(salt),
            calldata: calldata.map((v) => toHex(v)),
            version: 1,
        };
    }
}
//# sourceMappingURL=provider.js.map