# RCSB hosted endpoint acceptance

PR #48 changes the default connection for the existing `rcsb-pdb` card; it does not add a new card.

## Runtime evidence

- Checked at: 2026-10-19T05:25:20.491Z
- Executed by: Codex on behalf of maintainer duhu2000
- Official project: https://github.com/rcsb/rcsb-mcp
- Endpoint: https://mcp-beta.rcsb.org/mcp
- Authentication: none; no account, API key, OAuth or payment operation used.
- Server: rcsb_mcp 0.22.0; negotiated protocol: 2025-06-18.
- Initialize and tools/list succeeded; 36 tools advertised (not the historical local-package tool count).
- Explicit read-only call: `rcsb_get_entries` with `{"entry_ids":["4HHB"],"fields":"struct.title"}`.
- Tool result: success; credential scan: pass.
- Response SHA-256: `615c546d02b1f921f40d59ab23ce14620385183a9f1078ef2bc998369f6063b3`.

The repository runtime-acceptance script performed the checks. Raw responses, session identifiers and credentials were not retained. This is one public-data query, not acceptance of every tool or a real Desktop UI test. The upstream hosted endpoint is beta.

## Existing connections

Refreshing the catalog updates the card, not an already installed connection. Existing stdio connections may continue to use `uvx rcsb-mcp`; local execution still requires network access for data queries. Users who want the hosted endpoint should deliberately replace/reconfigure their existing connection and verify tools are discovered; do not delete a working connection until its settings have been preserved. No automatic migration or forced shutdown is part of this change.

Sequences, SMILES and other query inputs leave the user's machine. Only approved public/non-sensitive research inputs should be used.
