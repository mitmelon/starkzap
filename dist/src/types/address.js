import { validateAndParseAddress } from "starknet";
/**
 * Parse a Starknet address from a BigNumberish value.
 * @param value - The address to parse
 * @returns The validated address
 * @throws Argument must be a valid address inside the address range bound
 */
export function fromAddress(value) {
    return validateAndParseAddress(value);
}
//# sourceMappingURL=address.js.map