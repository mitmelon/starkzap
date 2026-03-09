---
name: Docs Export
triggers:
  - typedoc
  - docs export
  - docs:api
  - docs:export
---

# Docs Export

<purpose>
Generate and package Starkzap documentation artifacts for distribution.
</purpose>

<prerequisites>
- Dependencies installed.
- Source docs available at `docs/guide.md`.
- TypeDoc config available at `typedoc.json`.
</prerequisites>

<procedure>
1. Generate API docs with `npm run docs:api`.
2. Export docs bundle with `npm run docs:export`.
3. Confirm output is in `docs/export/` with `DEVELOPER_GUIDE.md`, `api/`, and `manifest.json`.
</procedure>

<patterns>
<do>
- Update guide content before exporting.
- Regenerate docs after API signature changes.
- Treat `docs/api/**` and `docs/export/**` as generated.
</do>
<dont>
- Do not manually patch generated markdown in `docs/api/**`.
- Do not run export without successful API doc generation.
</dont>
</patterns>

<examples>
```bash
npm run docs:api
npm run docs:export
```
</examples>

<troubleshooting>
- Missing `docs/guide.md`: create or restore guide file before export.
- Missing `docs/api`: run `npm run docs:api` first.
- Stale export manifest: rerun `npm run docs:export` to regenerate timestamp and contents.
</troubleshooting>
