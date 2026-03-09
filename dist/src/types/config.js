import { RpcProvider, CairoFelt252, constants, } from "starknet";
const VALID_CHAIN_IDS = ["SN_MAIN", "SN_SEPOLIA"];
/**
 * Represents a Starknet chain identifier.
 *
 * Provides helpers for chain detection and conversion between
 * literal strings and felt252 on-chain representations.
 *
 * @example
 * ```ts
 * // Use static constants (recommended)
 * const chain = ChainId.MAINNET;
 * const chain = ChainId.SEPOLIA;
 *
 * // Create from a literal
 * const chain = ChainId.from("SN_MAIN");
 *
 * // Create from an on-chain felt252 value
 * const chain = ChainId.fromFelt252(chainIdHex);
 *
 * // Check which chain
 * if (chain.isMainnet()) { ... }
 * if (chain.isSepolia()) { ... }
 * ```
 */
export class ChainId {
    constructor(value) {
        this.value = value;
    }
    /** Returns `true` if this is Starknet Mainnet (`SN_MAIN`). */
    isMainnet() {
        return this.value === "SN_MAIN";
    }
    /** Returns `true` if this is Starknet Sepolia testnet (`SN_SEPOLIA`). */
    isSepolia() {
        return this.value === "SN_SEPOLIA";
    }
    /**
     * Returns the felt252 (hex) representation used on-chain.
     * @throws Error if the chain ID is not recognized
     */
    toFelt252() {
        if (this.isMainnet())
            return constants.StarknetChainId.SN_MAIN;
        if (this.isSepolia())
            return constants.StarknetChainId.SN_SEPOLIA;
        throw new Error(`Unknown chain ID: ${this.value}`);
    }
    /** Returns the literal string value (e.g. `"SN_MAIN"` or `"SN_SEPOLIA"`). */
    toLiteral() {
        return this.value;
    }
    /**
     * Create a ChainId from a literal string.
     * @param literal - `"SN_MAIN"` or `"SN_SEPOLIA"`
     */
    static from(literal) {
        return new ChainId(literal);
    }
    /**
     * Create a ChainId from an on-chain felt252 hex value.
     * @param felt252 - The hex-encoded chain ID (e.g. from `provider.getChainId()`)
     * @throws Error if the decoded value is not a supported chain
     */
    static fromFelt252(felt252) {
        const decoded = new CairoFelt252(felt252).decodeUtf8();
        if (!VALID_CHAIN_IDS.includes(decoded)) {
            throw new Error(`Unsupported chain ID: "${decoded}". Expected one of: ${VALID_CHAIN_IDS.join(", ")}`);
        }
        return new ChainId(decoded);
    }
}
/** Pre-built instance for Starknet Mainnet. */
ChainId.MAINNET = new ChainId("SN_MAIN");
/** Pre-built instance for Starknet Sepolia testnet. */
ChainId.SEPOLIA = new ChainId("SN_SEPOLIA");
/**
 * Detect the chain ID from an RPC provider.
 * @param provider - The RPC provider to query
 * @returns The detected ChainId
 * @throws Error if the provider returns an unsupported chain
 */
export async function getChainId(provider) {
    const chainIdHex = await provider.getChainId();
    return ChainId.fromFelt252(chainIdHex);
}
//# sourceMappingURL=config.js.map