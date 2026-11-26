# n8n #23213 — n8n Backup to Notion — V3

[Published n8n template](https://n8n.io/workflows/23213-back-up-workflow-catalog-json-to-notion-with-n8n-api/) · [Source revision](https://github.com/paoloronco/n8n-templates/blob/main/workflows/n8n-notion-workflow-backup/workflow.json) · [Publication catalog](../../n8n-publications.md)

V3: 32 nodes plus the 12-node setup companion (10 operational, 2 notes) from repository history. Unified V4: 30 nodes, submission #22936 under review.

`public-export.json` preserves the workflow object returned by the official public n8n API, including node IDs, positions, sticky-note text and geometry, connector defaults, and public configuration/credential-binding references. JSON whitespace and key order are normalized; this is an unchanged workflow object, not the original HTTP response bytes. It is a release reference, not a claim that every provider integration was executed. Configure your own credentials before any import or activation.

Official source: `https://api.n8n.io/api/workflows/templates/23213`.

V3 requires [setup-notion-catalog.json](./setup-notion-catalog.json). Import and run setup once before configuring the V3 backup. The companion is retained from repository commit `3cf0e9a9fa2e9d572ff3f8030aa6db3d7795ecf8`. V4 does not require this companion.
