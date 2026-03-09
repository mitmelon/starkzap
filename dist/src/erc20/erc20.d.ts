import { type Address, Amount, type ExecuteOptions, type Token } from "../types/index.js";
import type { WalletInterface } from "../wallet/index.js";
import { type Call, type RpcProvider } from "starknet";
import type { Tx } from "../tx/index.js";
/**
 * ERC20 token interaction helper.
 *
 * Provides methods for common ERC20 operations: approvals, transfers,
 * and balance queries. Handles both `balance_of` (snake_case) and
 * `balanceOf` (camelCase) entrypoints for maximum compatibility.
 *
 * Instances are cached per-token on the wallet via `wallet.erc20(token)`.
 *
 * @example
 * ```ts
 * // Via wallet (recommended)
 * const balance = await wallet.balanceOf(USDC);
 * const tx = await wallet.transfer(USDC, [
 *   { to: recipient, amount: Amount.parse("100", USDC) },
 * ]);
 *
 * // Direct usage
 * const erc20 = new Erc20(USDC, provider);
 * const balance = await erc20.balanceOf(wallet);
 * ```
 */
export declare class Erc20 {
    private readonly token;
    private readonly contract;
    constructor(token: Token, provider: RpcProvider);
    /**
     * Validates that an Amount matches this ERC20 token's configuration.
     * @param amount - The Amount to validate
     * @throws Error if decimals or symbol don't match the token
     */
    private validateAmount;
    /**
     * Build an ERC20 approve Call without executing.
     *
     * @internal Used by {@link TxBuilder} — not part of the public API.
     */
    populateApprove(spender: Address, amount: Amount): Call;
    /**
     * Build transfer Call(s) without executing.
     *
     * @internal Used by {@link TxBuilder} — not part of the public API.
     */
    populateTransfer(transfers: {
        to: Address;
        amount: Amount;
    }[]): Call[];
    /**
     * Transfer tokens to one or more addresses.
     * @param from - Wallet to transfer tokens from
     * @param transfers - Array of transfer objects, each containing a to address and an Amount
     * @param options - Optional execution options
     *
     * @example
     * ```ts
     * const erc20 = wallet.erc20(USDC);
     * const amount = Amount.parse("100", USDC);
     *
     * const tx = await erc20.transfer(wallet, [
     *   { to: recipientAddress, amount },
     * ]);
     * await tx.wait();
     * ```
     *
     * @throws Error if any amount's decimals or symbol don't match the token
     */
    transfer(from: WalletInterface, transfers: {
        to: Address;
        amount: Amount;
    }[], options?: ExecuteOptions): Promise<Tx>;
    /**
     * Get the balance in a wallet.
     * @param wallet - Wallet to check the balance of
     * @returns Amount representing the token balance
     *
     * @example
     * ```ts
     * const erc20 = wallet.erc20(USDC);
     * const balance = await erc20.balanceOf(wallet);
     *
     * console.log(balance.toUnit());      // "100.5"
     * console.log(balance.toFormatted()); // "100.5 USDC"
     * ```
     */
    balanceOf(wallet: WalletInterface): Promise<Amount>;
}
//# sourceMappingURL=erc20.d.ts.map