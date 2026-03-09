import { type Call, type InvocationsSignerDetails, type DeployAccountSignerDetails, type DeclareSignerDetails, type Signature, type SignerInterface as StarknetSignerInterface, type TypedData } from "starknet";
import type { SignerInterface } from "../signer/interface.js";
/**
 * Adapter that bridges the SDK's minimal {@link SignerInterface} to the
 * full `starknet.js` `SignerInterface`.
 *
 * Custom signers only need to implement two methods (`getPubKey` + `signRaw`).
 * This adapter handles the complex transaction hash computations required by
 * `starknet.js` Account for invoke, deploy-account, and declare transactions.
 *
 * @remarks
 * You don't normally create this directly — the SDK creates it internally
 * when you call `sdk.connectWallet()`.
 *
 * @example
 * ```ts
 * import { SignerAdapter, StarkSigner } from "starkzap";
 * import { Account, RpcProvider } from "starknet";
 *
 * const adapter = new SignerAdapter(new StarkSigner(privateKey));
 * const account = new Account({ provider, address, signer: adapter });
 * ```
 */
export declare class SignerAdapter implements StarknetSignerInterface {
    private readonly signer;
    constructor(signer: SignerInterface);
    getPubKey(): Promise<string>;
    signMessage(typedData: TypedData, accountAddress: string): Promise<Signature>;
    signTransaction(transactions: Call[], details: InvocationsSignerDetails): Promise<Signature>;
    signDeployAccountTransaction(details: DeployAccountSignerDetails): Promise<Signature>;
    signDeclareTransaction(details: DeclareSignerDetails): Promise<Signature>;
}
//# sourceMappingURL=adapter.d.ts.map