import { type Calldata } from "starknet";
import type { PAYMASTER_API } from "@starknet-io/starknet-types-010";
import type { SignerInterface } from "../../signer/index.js";
import { type Address } from "../../types/index.js";
import type { AccountClassConfig } from "../../types/index.js";
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
export declare class AccountProvider {
    private readonly signer;
    private readonly accountClass;
    private cachedPublicKey;
    private cachedAddress;
    /**
     * @param signer - The signer implementation for signing operations
     * @param accountClass - Account class configuration (default: {@link OpenZeppelinPreset})
     */
    constructor(signer: SignerInterface, accountClass?: AccountClassConfig);
    /**
     * Compute and return the counterfactual address for this account.
     *
     * The address is derived from the signer's public key, the account class
     * hash, and the constructor calldata. Cached after first computation.
     *
     * @returns The Starknet address for this account
     */
    getAddress(): Promise<Address>;
    /**
     * Get the public key from the underlying signer. Cached after first call.
     * @returns The public key as a hex string
     */
    getPublicKey(): Promise<string>;
    /** Get the underlying signer instance. */
    getSigner(): SignerInterface;
    /** Get the account contract class hash. */
    getClassHash(): string;
    /** Build the constructor calldata from the given public key. */
    getConstructorCalldata(publicKey: string): Calldata;
    /** Compute the address salt from the given public key. */
    getSalt(publicKey: string): string;
    /**
     * Get deployment data for paymaster-sponsored deployment.
     */
    getDeploymentData(): Promise<PAYMASTER_API.ACCOUNT_DEPLOYMENT_DATA>;
}
//# sourceMappingURL=provider.d.ts.map