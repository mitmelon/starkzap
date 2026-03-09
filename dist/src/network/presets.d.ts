import { ChainId } from "../types/index.js";
/**
 * Network configuration preset.
 */
export interface NetworkPreset {
    /** Human-readable network name */
    name: string;
    /** Starknet chain ID */
    chainId: ChainId;
    /** Default RPC URL */
    rpcUrl: string;
    /** Block explorer URL (optional) */
    explorerUrl?: string;
}
/**
 * Starknet Mainnet configuration.
 */
export declare const mainnet: NetworkPreset;
/**
 * Starknet Sepolia Testnet configuration.
 */
export declare const sepolia: NetworkPreset;
/**
 * Local devnet configuration (using starknet-devnet-rs defaults).
 */
export declare const devnet: NetworkPreset;
/**
 * All available network presets.
 */
export declare const networks: {
    readonly mainnet: NetworkPreset;
    readonly sepolia: NetworkPreset;
    readonly devnet: NetworkPreset;
};
export type NetworkName = keyof typeof networks;
//# sourceMappingURL=presets.d.ts.map