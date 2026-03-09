---
name: Presets Regeneration
triggers:
  - generate tokens
  - generate validators
  - AVNU
  - VOYAGER_API_KEY
  - preset files
---

# Presets Regeneration

<purpose>
Regenerate token and validator preset files from upstream APIs without manual edits.
</purpose>

<prerequisites>
- Dependencies installed (`npm install`).
- Network access to AVNU and/or Voyager APIs.
- `VOYAGER_API_KEY` set for validator generation.
</prerequisites>

<procedure>
1. Token presets:
- Mainnet: `npm run generate:tokens`
- Sepolia: `npm run generate:tokens:sepolia`
2. Validator presets:
- Mainnet: `npm run generate:validators`
- Sepolia: `npm run generate:validators:sepolia`
3. Review generated diffs in:
- `src/erc20/token/presets.ts`
- `src/erc20/token/presets.sepolia.ts`
- `src/staking/validator/presets.ts`
- `src/staking/validator/presets.sepolia.ts`
</procedure>

<patterns>
<do>
- Treat generated files as script-owned outputs.
- Keep generation commands and resulting file changes in the same task.
- Note source API context in PR/task summary when changes are large.
</do>
<dont>
- Do not hand-edit generated preset files.
- Do not regenerate unrelated preset sets without a reason.
- Do not commit partial generation output.
</dont>
</patterns>

<examples>
```bash
npm run generate:tokens
npm run generate:tokens:sepolia
VOYAGER_API_KEY=... npm run generate:validators
VOYAGER_API_KEY=... npm run generate:validators:sepolia
```
</examples>

<troubleshooting>
- `--network flag is required`: use the provided npm scripts instead of raw script calls.
- Voyager auth error: check `VOYAGER_API_KEY`.
- Unexpected large diff: validate upstream API response and rerun once before escalating.
</troubleshooting>
