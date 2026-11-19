# Google Cloud Inventory and IAM Audit — V2

Revision 2.2.1. Explicit project inventory with five Google Sheets tabs.

Collect Google Cloud inventory and visible IAM policies, retain complete snapshots and changes in BigQuery, review governance findings in Google Sheets, and download HTML/CSV reports. Optional email reports substantive additions and removals while suppressing routine lifecycle records and confirmed Google-managed key rotations.

- [Import the inactive workflow](./google-cloud-inventory-workflow.json): 52 nodes, including seven documentation notes; 11 Google HTTP Request nodes.
- [Complete setup](./SETUP.md): credentials, IAM/API access, dashboard, configuration and manual checks.
- [Verification and precise revision scope](./VERIFICATION.md).

The canvas mirrors the owner's approved compact horizontal arrangement, with separate worker, delivery and failure bands. Existing operational node IDs are preserved. The overview explains setup; short section notes explain the adjacent operations.

## Revision scope

Updated canvas geometry and annotations; configurable `n8nBaseUrl`; disabled-by-default email; consistent filtering across email counts, body and resource-change CSV; before/after metadata returned by the comparison query for safe key classification. Full inventory and change history remain available. Added a documentation note around the existing shared BigQuery worker.

No credentials, personal account/project configuration, workflow instance IDs, webhooks or execution samples are embedded in this JSON. Example configuration values must be replaced before running. Published repository files do not submit a Creator Portal revision.
