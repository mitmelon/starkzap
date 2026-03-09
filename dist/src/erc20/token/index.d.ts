import { RpcProvider } from "starknet";
import { type Address, type ChainId, type Token } from "../../types/index.js";
export * from "../../erc20/token/presets.js";
export * from "../../erc20/token/presets.sepolia";
export declare function getPresets(chainId: ChainId): Record<string, Token>;
export declare function getTokensFromAddresses(tokenAddresses: Address[], provider: RpcProvider): Promise<Token[]>;
//# sourceMappingURL=index.d.ts.map