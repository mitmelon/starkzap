import { ChainId } from "../types/index.js";
/**
 * Starknet Mainnet configuration.
 */
export const mainnet = {
    name: "Mainnet",
    chainId: ChainId.MAINNET,
    rpcUrl: "https://api.cartridge.gg/x/starknet/mainnet",
    explorerUrl: "https://voyager.online",
};
/**
 * Starknet Sepolia Testnet configuration.
 */
export const sepolia = {
    name: "Sepolia",
    chainId: ChainId.SEPOLIA,
    rpcUrl: "https://api.cartridge.gg/x/starknet/sepolia",
    explorerUrl: "https://sepolia.voyager.online",
};
/**
 * Local devnet configuration (using starknet-devnet-rs defaults).
 */
export const devnet = {
    name: "Devnet",
    chainId: ChainId.SEPOLIA, // Devnet typically uses Sepolia chain ID
    rpcUrl: "http://localhost:5050",
};
/**
 * All available network presets.
 */
export const networks = {
    mainnet,
    sepolia,
    devnet,
};
//# sourceMappingURL=presets.js.map