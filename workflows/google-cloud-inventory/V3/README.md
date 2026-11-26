# Google Cloud Inventory and IAM Audit — V3

## n8n publication and source versions

- [n8n #22943 — V3.0.1](https://n8n.io/workflows/22943-audit-google-cloud-inventory-and-iam-with-bigquery-and-google-sheets/): 62 nodes; exact workflow-object match including notes and layout. Removal was requested for obsolete submission #21565 only. [Published release reference](https://github.com/paoloronco/n8n-templates/tree/main/catalog/n8n-published/22943).


## Documentation links

- [Setup and operations for this version](https://github.com/paoloronco/n8n-templates/blob/main/workflows/google-cloud-inventory/V3/SETUP.md)

Revision 3.0.2. Accessible-project discovery, native metadata collectors and eight Google Sheets tabs.

Collect Google Cloud inventory and visible IAM policies, retain complete snapshots and changes in BigQuery, review governance findings in Google Sheets, and download HTML/CSV reports. Optional email reports substantive additions and removals while suppressing routine lifecycle records and confirmed Google-managed key rotations.

- [Import the inactive workflow](./google-cloud-inventory-workflow.json): 62 nodes, including seven documentation notes; 16 Google HTTP Request nodes.
- [Complete setup](./SETUP.md): credentials, IAM/API access, dashboard, configuration and manual checks.
- [Verification and precise revision scope](./VERIFICATION.md).

The canvas mirrors the owner's approved compact horizontal arrangement, with separate worker, delivery and failure bands. Existing operational node IDs are preserved. The overview explains setup; short section notes explain the adjacent operations.

## Revision scope

Updated canvas geometry and annotations; configurable `n8nBaseUrl`; disabled-by-default email; consistent filtering across email counts, body and resource-change CSV; before/after metadata returned by the comparison query for safe key classification. Full inventory and change history remain available. Automatic discovery no longer starts with example projects preconfigured as required fallbacks.

No credentials, personal account/project configuration, workflow instance IDs, webhooks or execution samples are embedded in this JSON. Example configuration values must be replaced before running. Published repository files do not submit a Creator Portal revision.

## Revised presentation and privacy

The reviewed horizontal canvas and seven concise notes are applied to the current V3 runtime. Existing notification filtering, metadata checks and configurable execution links are retained. Owner contact details and private documentation references were removed; public setup assets remain documented. No private credentials, instance metadata or execution samples are distributed.
