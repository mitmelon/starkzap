import { type ChainId, type StakingConfig } from "../types/index.js";
/**
 * Core staking contract presets per supported chain.
 *
 * These defaults are used by `StarkZap` when `staking.contract`
 * is not explicitly provided in the SDK config.
 */
export declare const stakingPresets: {
    readonly SN_MAIN: {
        readonly contract: import("../types/index.js").Address;
    };
    readonly SN_SEPOLIA: {
        readonly contract: import("../types/index.js").Address;
    };
};
/**
 * Returns the default staking config for a given chain.
 */
export declare function getStakingPreset(chainId: ChainId): StakingConfig;
//# sourceMappingURL=presets.d.ts.map