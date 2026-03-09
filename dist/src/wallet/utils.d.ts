import { RpcProvider, type Call, type PaymasterTimeBounds } from "starknet";
import type { PAYMASTER_API } from "@starknet-io/starknet-types-010";
import { Tx } from "../tx/index.js";
import type { Address } from "../types/index.js";
import type { DeployOptions, EnsureReadyOptions, PreflightOptions, PreflightResult } from "../types/index.js";
/**
 * Shared wallet utilities.
 * Used by wallet implementations to avoid code duplication.
 */
/**
 * Check if an account is deployed on-chain.
 */
export declare function checkDeployed(provider: RpcProvider, address: Address): Promise<boolean>;
/**
 * Ensure a wallet is ready for transactions.
 */
export declare function ensureWalletReady(wallet: {
    isDeployed: () => Promise<boolean>;
    deploy: (options?: DeployOptions) => Promise<Tx>;
}, options?: EnsureReadyOptions): Promise<void>;
/**
 * Simulate a transaction to check if it would succeed.
 */
export declare function preflightTransaction(wallet: {
    isDeployed: () => Promise<boolean>;
}, account: {
    simulateTransaction: (invocations: Array<{
        type: "INVOKE";
        payload: Call[];
    }>) => Promise<unknown[]>;
}, options: PreflightOptions): Promise<PreflightResult>;
/** Paymaster details for sponsored transactions */
export declare function sponsoredDetails(timeBounds?: PaymasterTimeBounds, deploymentData?: PAYMASTER_API.ACCOUNT_DEPLOYMENT_DATA): {
    deploymentData?: PAYMASTER_API.ACCOUNT_DEPLOYMENT_DATA;
    timeBounds?: PaymasterTimeBounds;
    feeMode: {
        mode: "sponsored";
    };
};
//# sourceMappingURL=utils.d.ts.map