import type { BigNumberish } from "starknet";
import type { Token } from "../types/token.js";
/**
 * Arguments for the Amount constructor.
 * Either a Token object, or the number of decimal places and optional symbol.
 */
export type AmountArgs = [token: Token] | [decimals: number, symbol?: string];
/**
 * Represents a token amount with precision handling for blockchain operations.
 *
 * The Amount class provides a safe way to handle token amounts by distinguishing between:
 * - **Unit values**: Human-readable values (e.g., 1.5 ETH, 100 USDC)
 * - **Raw values**: Raw blockchain values with full precision (e.g., 1500000000000000000 wei)
 *
 * This separation prevents common precision errors when working with blockchain token amounts.
 *
 * @example
 * ```ts
 * // Creating from human-readable values with a Token
 * const strkAmount = Amount.parse("10", STRK);
 * const usdcAmount = Amount.parse(100, USDC);
 *
 * // Creating from human-readable values with decimals
 * const ethAmount = Amount.parse("1.5", 18, "ETH");
 *
 * // Creating from raw blockchain values with a Token
 * const balance = Amount.fromRaw(1500000000000000000n, ETH);
 *
 * // Creating from raw blockchain values with decimals
 * const rawAmount = Amount.fromRaw(1500000000000000000n, 18, "ETH");
 *
 * // Converting for display or contract calls
 * console.log(ethAmount.toUnit());      // "1.5"
 * console.log(ethAmount.toBase());      // 1500000000000000000n
 * console.log(ethAmount.toFormatted()); // "1.5 ETH" (locale-formatted)
 * ```
 */
export declare class Amount {
    /**
     * The raw base value (e.g., FRI, wei) - Single Source of Truth.
     * All conversions derive from this value.
     */
    private readonly baseValue;
    /**
     * Number of decimal places for this token (e.g., 18 for ETH, 6 for USDC).
     */
    private readonly decimals;
    /**
     * Optional token symbol for display purposes (e.g., "ETH", "STRK").
     */
    private readonly symbol;
    private constructor();
    /**
     * Creates an Amount from a human-readable unit value (e.g., "1.5" ETH).
     *
     * Use this method when you have a value that a user would recognize,
     * like "1.5" for 1.5 ETH or "100" for 100 USDC.
     *
     * @param amount - The unit amount as string, number, or bigint
     * @param args - Either a `Token` object, or `decimals` and optional `symbol`:
     *   - `(token: Token)` - Uses the token's decimals and symbol
     *   - `(decimals: number, symbol?: string)` - Uses explicit decimals and optional symbol
     * @returns A new Amount instance
     * @throws Error if the amount format is invalid (negative, non-numeric)
     * @throws Error if the amount exceeds the specified decimal precision
     *
     * @example
     * ```ts
     * // With a Token (recommended for known tokens)
     * Amount.parse("1.5", STRK)          // Uses STRK's decimals and symbol
     * Amount.parse(100, USDC)            // Uses USDC's decimals and symbol
     *
     * // With decimals and optional symbol
     * Amount.parse("1.5", 18, "ETH")     // 1.5 ETH = 1500000000000000000 wei
     * Amount.parse(1.5, 18, "ETH")       // Same as above (number input)
     * Amount.parse(10n, 18, "ETH")       // 10 ETH (bigint treated as whole units)
     * Amount.parse("100", 6, "USDC")     // 100 USDC = 100000000 base units
     * Amount.parse("0.5", 8)             // 0.5 with 8 decimals, no symbol
     * ```
     */
    static parse(amount: BigNumberish, ...args: AmountArgs): Amount;
    /**
     * Creates an Amount directly from a raw value (e.g., wei, FRI, satoshis).
     *
     * Use this method when you have a value directly from the blockchain,
     * such as a balance query or transaction amount.
     *
     * @param amount - The raw amount as string, number, or bigint
     * @param args - Either a `Token` object, or `decimals` and optional `symbol`:
     *   - `(token: Token)` - Uses the token's decimals and symbol
     *   - `(decimals: number, symbol?: string)` - Uses explicit decimals and optional symbol
     * @returns A new Amount instance
     * @throws Error if the amount is negative
     *
     * @example
     * ```ts
     * // With a Token (recommended for known tokens)
     * const balance = await contract.balanceOf(address);
     * Amount.fromRaw(balance, STRK)                    // Uses STRK's decimals and symbol
     *
     * // With decimals and optional symbol
     * Amount.fromRaw(1500000000000000000n, 18, "ETH")  // 1.5 ETH
     * Amount.fromRaw("1500000000000000000", 18, "ETH") // From string (e.g., JSON response)
     * Amount.fromRaw(1000000, 6, "USDC")               // 1 USDC
     * Amount.fromRaw(1000000n, 6)                      // 1 unit, no symbol
     * ```
     */
    static fromRaw(amount: BigNumberish, ...args: AmountArgs): Amount;
    /**
     * Returns the raw base value as a bigint for use in smart contract calls.
     *
     * This is the value you should pass to Starknet contracts and other
     * blockchain operations that expect raw token amounts.
     *
     * @returns The raw base value as bigint (e.g., wei, FRI)
     *
     * @example
     * ```ts
     * const amount = Amount.parse("1.5", 18, "ETH");
     * const rawValue = amount.toBase(); // 1500000000000000000n
     *
     * // Use in contract call
     * await contract.transfer(recipient, rawValue);
     * ```
     */
    toBase(): bigint;
    /**
     * Returns the human-readable unit value as a string.
     *
     * This is the value suitable for displaying to users. Trailing zeros
     * after the decimal point are automatically removed.
     *
     * @returns The unit value as a string (e.g., "1.5", "100", "0.001")
     *
     * @example
     * ```ts
     * Amount.fromRaw(1500000000000000000n, 18).toUnit()  // "1.5"
     * Amount.fromRaw(1000000000000000000n, 18).toUnit()  // "1"
     * Amount.fromRaw(500n, 18).toUnit()                   // "0.0000000000000005"
     * Amount.fromRaw(100000000n, 6).toUnit()              // "100"
     * ```
     */
    toUnit(): string;
    /**
     * Returns a locale-formatted string with the token symbol for UI display.
     *
     * Uses the device's preferred locale for number formatting, including
     * appropriate thousand separators and decimal notation.
     *
     * @param compressed - If true, limits decimal places to 4 for compact display (default: false)
     * @returns Formatted string with symbol (e.g., "1,500.50 ETH", "0.0001 STRK")
     *
     * @example
     * ```ts
     * const amount = Amount.parse("1500.123456", 18, "ETH");
     *
     * amount.toFormatted()       // "1,500.123456 ETH" (full precision)
     * amount.toFormatted(true)   // "1,500.1235 ETH" (compressed to 4 decimals)
     *
     * // Without symbol
     * const noSymbol = Amount.parse("100", 6);
     * noSymbol.toFormatted()     // "100" (no symbol appended)
     * ```
     */
    toFormatted(compressed?: boolean): string;
    /**
     * Returns the number of decimal places for this amount.
     *
     * Useful for validation when working with specific token contracts.
     *
     * @returns The number of decimal places (e.g., 18 for ETH, 6 for USDC)
     *
     * @example
     * ```ts
     * const ethAmount = Amount.parse("1.5", 18, "ETH");
     * console.log(ethAmount.getDecimals()); // 18
     *
     * const usdcAmount = Amount.parse("100", USDC);
     * console.log(usdcAmount.getDecimals()); // 6
     * ```
     */
    getDecimals(): number;
    /**
     * Returns the token symbol for this amount, if set.
     *
     * Useful for validation when working with specific token contracts.
     *
     * @returns The token symbol (e.g., "ETH", "USDC") or undefined if not set
     *
     * @example
     * ```ts
     * const ethAmount = Amount.parse("1.5", 18, "ETH");
     * console.log(ethAmount.getSymbol()); // "ETH"
     *
     * const noSymbol = Amount.parse("1.5", 18);
     * console.log(noSymbol.getSymbol()); // undefined
     * ```
     */
    getSymbol(): string | undefined;
    /**
     * Checks if another Amount is compatible for operations.
     * Two amounts are compatible if they have the same decimals and symbol.
     *
     * @param other - The other Amount to check against
     * @returns true if compatible, false otherwise
     */
    private isCompatible;
    /**
     * Validates that another Amount is compatible for arithmetic operations.
     * Two amounts are compatible if they have the same decimals and symbol.
     *
     * @param other - The other Amount to validate against
     * @throws Error if decimals don't match
     * @throws Error if symbols don't match (when both are set)
     */
    private assertCompatible;
    /**
     * Adds another Amount to this one.
     *
     * Both amounts must have the same decimals and symbol (if set).
     *
     * @param other - The Amount to add
     * @returns A new Amount representing the sum
     * @throws Error if decimals don't match
     * @throws Error if symbols don't match (when both are set)
     *
     * @example
     * ```ts
     * const a = Amount.parse("1.5", 18, "ETH");
     * const b = Amount.parse("2.5", 18, "ETH");
     * const sum = a.add(b);
     * console.log(sum.toUnit()); // "4"
     * ```
     */
    add(other: Amount): Amount;
    /**
     * Subtracts another Amount from this one.
     *
     * Both amounts must have the same decimals and symbol (if set).
     *
     * @param other - The Amount to subtract
     * @returns A new Amount representing the difference
     * @throws Error if decimals don't match
     * @throws Error if symbols don't match (when both are set)
     * @throws Error if the result would be negative (other > this)
     *
     * @example
     * ```ts
     * const a = Amount.parse("5", 18, "ETH");
     * const b = Amount.parse("2", 18, "ETH");
     * const diff = a.subtract(b);
     * console.log(diff.toUnit()); // "3"
     * ```
     */
    subtract(other: Amount): Amount;
    /**
     * Multiplies this Amount by a scalar value.
     *
     * The scalar can be a string, number, or bigint. Fractional multipliers
     * are supported (e.g., "0.5" to halve the amount).
     *
     * @param multiplier - The scalar value to multiply by
     * @returns A new Amount representing the product
     * @throws Error if multiplier is negative or invalid
     *
     * @example
     * ```ts
     * const amount = Amount.parse("10", 18, "ETH");
     *
     * amount.multiply(2).toUnit();     // "20"
     * amount.multiply("0.5").toUnit(); // "5"
     * amount.multiply("1.5").toUnit(); // "15"
     * ```
     */
    multiply(multiplier: BigNumberish): Amount;
    /**
     * Divides this Amount by a scalar value.
     *
     * The scalar can be a string, number, or bigint. Fractional divisors
     * are supported (e.g., "0.5" to double the amount).
     *
     * Note: Division uses integer arithmetic and rounds down (floor).
     *
     * @param divisor - The scalar value to divide by
     * @returns A new Amount representing the quotient
     * @throws Error if divisor is zero
     * @throws Error if divisor is negative or invalid
     *
     * @example
     * ```ts
     * const amount = Amount.parse("10", 18, "ETH");
     *
     * amount.divide(2).toUnit();     // "5"
     * amount.divide("0.5").toUnit(); // "20"
     * amount.divide(4).toUnit();     // "2.5"
     * ```
     */
    divide(divisor: BigNumberish): Amount;
    /**
     * Checks if this Amount is equal to another Amount.
     *
     * Returns false if amounts have different decimals or symbols.
     *
     * @param other - The Amount to compare with
     * @returns true if the amounts are equal and compatible, false otherwise
     *
     * @example
     * ```ts
     * const a = Amount.parse("1.5", 18, "ETH");
     * const b = Amount.parse("1.5", 18, "ETH");
     * const c = Amount.parse("2", 18, "ETH");
     * const usdc = Amount.parse("1.5", 6, "USDC");
     *
     * a.eq(b);    // true
     * a.eq(c);    // false
     * a.eq(usdc); // false (incompatible)
     * ```
     */
    eq(other: Amount): boolean;
    /**
     * Checks if this Amount is greater than another Amount.
     *
     * Returns false if amounts have different decimals or symbols.
     *
     * @param other - The Amount to compare with
     * @returns true if this amount is greater and compatible, false otherwise
     *
     * @example
     * ```ts
     * const a = Amount.parse("2", 18, "ETH");
     * const b = Amount.parse("1", 18, "ETH");
     * const usdc = Amount.parse("1", 6, "USDC");
     *
     * a.gt(b);    // true
     * b.gt(a);    // false
     * a.gt(usdc); // false (incompatible)
     * ```
     */
    gt(other: Amount): boolean;
    /**
     * Checks if this Amount is greater than or equal to another Amount.
     *
     * Returns false if amounts have different decimals or symbols.
     *
     * @param other - The Amount to compare with
     * @returns true if this amount is greater or equal and compatible, false otherwise
     *
     * @example
     * ```ts
     * const a = Amount.parse("2", 18, "ETH");
     * const b = Amount.parse("2", 18, "ETH");
     * const usdc = Amount.parse("2", 6, "USDC");
     *
     * a.gte(b);    // true
     * a.gte(usdc); // false (incompatible)
     * ```
     */
    gte(other: Amount): boolean;
    /**
     * Checks if this Amount is less than another Amount.
     *
     * Returns false if amounts have different decimals or symbols.
     *
     * @param other - The Amount to compare with
     * @returns true if this amount is less and compatible, false otherwise
     *
     * @example
     * ```ts
     * const a = Amount.parse("1", 18, "ETH");
     * const b = Amount.parse("2", 18, "ETH");
     * const usdc = Amount.parse("2", 6, "USDC");
     *
     * a.lt(b);    // true
     * b.lt(a);    // false
     * a.lt(usdc); // false (incompatible)
     * ```
     */
    lt(other: Amount): boolean;
    /**
     * Checks if this Amount is less than or equal to another Amount.
     *
     * Returns false if amounts have different decimals or symbols.
     *
     * @param other - The Amount to compare with
     * @returns true if this amount is less or equal and compatible, false otherwise
     *
     * @example
     * ```ts
     * const a = Amount.parse("2", 18, "ETH");
     * const b = Amount.parse("2", 18, "ETH");
     * const usdc = Amount.parse("2", 6, "USDC");
     *
     * a.lte(b);    // true
     * a.lte(usdc); // false (incompatible)
     * ```
     */
    lte(other: Amount): boolean;
    /**
     * Checks if this Amount is zero.
     *
     * @returns true if the amount is zero, false otherwise
     *
     * @example
     * ```ts
     * Amount.parse("0", 18, "ETH").isZero();   // true
     * Amount.parse("0.1", 18, "ETH").isZero(); // false
     * ```
     */
    isZero(): boolean;
    /**
     * Checks if this Amount is positive (greater than zero).
     *
     * @returns true if the amount is positive, false otherwise
     *
     * @example
     * ```ts
     * Amount.parse("1", 18, "ETH").isPositive(); // true
     * Amount.parse("0", 18, "ETH").isPositive(); // false
     * ```
     */
    isPositive(): boolean;
}
/**
 * Formats a token amount for display in the UI with locale-aware number formatting.
 *
 * This standalone function is useful when you have raw balance data and want to
 * format it without creating an Amount instance. For most cases, prefer using
 * `Amount.toFormatted()` instead.
 *
 * @param compressed - If true, limits decimal places to 4 for compact display
 * @param balance - Raw base value as bigint (e.g., wei, FRI)
 * @param decimals - Number of decimal places for the token
 * @param symbol - Token symbol to append (e.g., "ETH", "STRK")
 * @returns Locale-formatted string with symbol
 *
 * @example
 * ```ts
 * // Basic usage
 * tokenAmountToFormatted(false, 1500000000000000000n, 18, "ETH")
 * // Returns: "1.5 ETH" (exact format depends on locale)
 *
 * // Compressed format for UI
 * tokenAmountToFormatted(true, 1234567890123456789n, 18, "ETH")
 * // Returns: "1.2346 ETH" (rounded to 4 decimal places)
 *
 * // Large numbers with thousand separators
 * tokenAmountToFormatted(false, 1500000000000n, 6, "USDC")
 * // Returns: "1,500,000 USDC" (in US locale)
 * ```
 */
export declare function tokenAmountToFormatted(compressed: boolean | undefined, balance: bigint, decimals: number, symbol: string): string;
//# sourceMappingURL=amount.d.ts.map