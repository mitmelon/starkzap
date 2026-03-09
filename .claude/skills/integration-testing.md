---
name: Integration Testing
triggers:
  - integration test
  - starknet-devnet
  - FORK_NETWORK
  - test:integration
---

# Integration Testing

<purpose>
Run and debug Starkzap integration tests that require a spawned `starknet-devnet` instance.
</purpose>

<prerequisites>
- Dependencies installed with `npm install`.
- Node.js runtime compatible with project dependencies.
- No conflicting local process on devnet port.
- Optional: `FORK_NETWORK` set when running fork-based scenarios.
</prerequisites>

<procedure>
1. Run integration tests with `npm run test:integration`.
2. For full matrix including unit tests, use `npm run test:all`.
3. When testing fork behavior, set `FORK_NETWORK` and rerun `npm run test:integration`.
4. Keep changes scoped to `tests/integration/*` unless SDK logic also changes.
</procedure>

<patterns>
<do>
- Use `tests/integration/globalSetup.ts` as the source of truth for devnet lifecycle behavior.
- Keep integration assertions deterministic and chain-aware.
- Reuse shared helpers from `tests/integration/shared.ts`.
</do>
<dont>
- Do not hardcode production keys or private endpoints.
- Do not rely on test ordering unless explicitly configured.
- Do not mix large refactors with integration-test debugging in one task.
</dont>
</patterns>

<examples>
```bash
npm run test:integration
FORK_NETWORK=https://starknet-sepolia.public.blastapi.io npm run test:integration
```
</examples>

<troubleshooting>
- Devnet setup timeout: rerun once and verify no conflicting local process.
- Chain mismatch errors: confirm `rpcUrl` and `chainId` agree in test config.
- Flaky fork runs: verify `FORK_NETWORK` endpoint availability and RPC version compatibility.
</troubleshooting>
