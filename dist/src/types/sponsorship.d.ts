export type { PaymasterDetails, PaymasterOptions, PaymasterTimeBounds, } from "starknet";
import type { FeeMode as StarknetFeeMode } from "starknet";
/**
 * Fee mode for paymaster transactions.
 * - `{ mode: 'sponsored' }`: AVNU paymaster covers gas
 * - `{ mode: 'default', gasToken: '0x...' }`: Pay in specified token
 *
 * @example
 * ```ts
 * // Sponsored (gasless)
 * { mode: 'sponsored' }
 *
 * // Pay in STRK
 * { mode: 'default', gasToken: STRK_ADDRESS }
 * ```
 */
export type PaymasterFeeMode = StarknetFeeMode;
//# sourceMappingURL=sponsorship.d.ts.map