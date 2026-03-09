import { CairoFelt252, Contract, RpcProvider } from "starknet";
import { getChainId } from "../../types/index.js";
import { groupBy } from "../../utils/index.js";
import { mainnetTokens } from "../../erc20/token/presets.js";
import { sepoliaTokens } from "../../erc20/token/presets.sepolia";
import { ABI as ERC20_ABI } from "../../abi/erc20.js";
export * from "../../erc20/token/presets.js";
export * from "../../erc20/token/presets.sepolia";
export function getPresets(chainId) {
    if (chainId.isMainnet())
        return mainnetTokens;
    if (chainId.isSepolia())
        return sepoliaTokens;
    return {};
}
const MAX_PARALLEL_TOKEN_REQUESTS = 8;
const MAX_TOKEN_NAME_LENGTH = 128;
const MAX_TOKEN_SYMBOL_LENGTH = 32;
const MAX_TOKEN_DECIMALS = 255n;
function sanitizeTokenText(input, maxLength) {
    const clean = Array.from(input)
        .filter((char) => {
        const code = char.charCodeAt(0);
        return code >= 0x20 && code !== 0x7f;
    })
        .join("")
        .trim();
    return clean.slice(0, maxLength);
}
function parseTokenDecimals(decimals) {
    let asBigInt;
    try {
        asBigInt = BigInt(decimals);
    }
    catch {
        throw new Error(`Invalid token decimals value: ${String(decimals)}`);
    }
    if (asBigInt < 0n) {
        throw new Error("Token decimals cannot be negative");
    }
    if (asBigInt > MAX_TOKEN_DECIMALS) {
        throw new Error(`Token decimals too large: ${asBigInt.toString()}`);
    }
    return Number(asBigInt);
}
async function mapWithConcurrency(items, concurrency, mapper) {
    const results = new Array(items.length);
    let index = 0;
    const worker = async () => {
        while (index < items.length) {
            const current = index;
            index += 1;
            const item = items[current];
            if (item === undefined) {
                continue;
            }
            results[current] = await mapper(item);
        }
    };
    const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
    await Promise.all(workers);
    return results;
}
async function resolveUnknownToken(address, provider) {
    const contract = new Contract({
        abi: ERC20_ABI,
        address: address,
        providerOrAccount: provider,
    }).typedv2(ERC20_ABI);
    try {
        const [rawName, rawSymbol, rawDecimals] = await Promise.all([
            contract.name(),
            contract.symbol(),
            contract.decimals(),
        ]);
        const name = sanitizeTokenText(new CairoFelt252(rawName).decodeUtf8(), MAX_TOKEN_NAME_LENGTH);
        const symbol = sanitizeTokenText(new CairoFelt252(rawSymbol).decodeUtf8(), MAX_TOKEN_SYMBOL_LENGTH);
        const decimals = parseTokenDecimals(rawDecimals);
        if (!name || !symbol) {
            throw new Error("Token metadata returned empty name or symbol");
        }
        return {
            name,
            address,
            decimals,
            symbol,
        };
    }
    catch (error) {
        console.warn(`Could not determine token ${address}: ${error instanceof Error ? error.message : String(error)}`);
        return null;
    }
}
export async function getTokensFromAddresses(tokenAddresses, provider) {
    const chainId = await getChainId(provider);
    const presetTokens = Object.values(getPresets(chainId));
    const tokens = [];
    const unknownTokenAddresses = [];
    const presetByAddress = groupBy(presetTokens, (preset) => preset.address);
    for (const tokenAddress of tokenAddresses) {
        const token = presetByAddress.get(tokenAddress)?.[0];
        if (token) {
            tokens.push(token);
        }
        else {
            unknownTokenAddresses.push(tokenAddress);
        }
    }
    if (unknownTokenAddresses.length > 0) {
        const resolvedUnknownTokens = await mapWithConcurrency(unknownTokenAddresses, MAX_PARALLEL_TOKEN_REQUESTS, async (address) => resolveUnknownToken(address, provider));
        tokens.push(...resolvedUnknownTokens.filter((token) => token !== null));
    }
    return tokens;
}
//# sourceMappingURL=index.js.map