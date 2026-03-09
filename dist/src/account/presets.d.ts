import type { AccountClassConfig } from "../types/index.js";
/**
 * Devnet account preset.
 * Uses the pre-declared account class on starknet-devnet.
 */
export declare const DevnetPreset: AccountClassConfig;
/**
 * OpenZeppelin account preset.
 */
export declare const OpenZeppelinPreset: AccountClassConfig;
/**
 * Argent account preset (v0.4.0).
 * Uses CairoCustomEnum for the owner signer.
 */
export declare const ArgentPreset: AccountClassConfig;
/**
 * Braavos account preset (v1.2.0) with Stark key.
 *
 * Uses BraavosBaseAccount for deployment which then upgrades to BraavosAccount.
 *
 * Deployment signature format (15 elements):
 * - [0-1]: Transaction signature (r, s)
 * - [2]: Implementation class hash (BraavosAccount)
 * - [3-11]: Auxiliary data (zeros for basic Stark-only account)
 * - [12]: Chain ID as felt
 * - [13-14]: Auxiliary data signature (r, s)
 *
 * @see https://github.com/myBraavos/braavos-account-cairo
 */
export declare const BraavosPreset: AccountClassConfig;
/**
 * Braavos implementation class hash (for reference).
 * This is the class the account upgrades to after deployment.
 */
export declare const BRAAVOS_IMPL_CLASS_HASH = "0x03957f9f5a1cbfe918cedc2015c85200ca51a5f7506ecb6de98a5207b759bf8a";
/**
 * ArgentX v0.5.0 account preset.
 * This is the account class used by Privy for Starknet wallets.
 *
 * @see https://docs.privy.io/recipes/use-tier-2#starknet
 */
export declare const ArgentXV050Preset: AccountClassConfig;
export declare const accountPresets: {
    readonly devnet: AccountClassConfig;
    readonly openzeppelin: AccountClassConfig;
    readonly argent: AccountClassConfig;
    readonly braavos: AccountClassConfig;
    readonly argentXV050: AccountClassConfig;
};
export type AccountPresetName = keyof typeof accountPresets;
//# sourceMappingURL=presets.d.ts.map