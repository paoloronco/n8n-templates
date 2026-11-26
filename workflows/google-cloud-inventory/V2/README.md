# Google Cloud Inventory and IAM Audit — V2

## n8n publication and source versions

- [n8n #22116 — V2.0.1](https://n8n.io/workflows/22116-audit-google-cloud-inventory-and-iam-changes-with-bigquery-and-google-sheets/): Published V2.0.1: 47 nodes. Main V2 folder contains later V2.2.1 with 52 nodes. V3 #22943 is a separate listing. [Published release reference](https://github.com/paoloronco/n8n-templates/tree/main/catalog/n8n-published/22116).


## Documentation links

- [Full Notion documentation](https://paoloronco.notion.site/408f0ba27c3281aea226fecadfab05f8)
- [Complete configuration and IAM setup](https://github.com/paoloronco/n8n-templates/blob/main/workflows/google-cloud-inventory/V2/SETUP.md)

Revision 2.2.1. Explicit project inventory with five Google Sheets tabs.

Collect Google Cloud inventory and visible IAM policies, retain complete snapshots and changes in BigQuery, review governance findings in Google Sheets, and download HTML/CSV reports. Optional email reports substantive additions and removals while suppressing routine lifecycle records and confirmed Google-managed key rotations.

- [Import the inactive workflow](./google-cloud-inventory-workflow.json): 52 nodes, including seven documentation notes; 11 Google HTTP Request nodes.
- [Complete setup](./SETUP.md): credentials, IAM/API access, dashboard, configuration and manual checks.
- [Verification and precise revision scope](./VERIFICATION.md).

The canvas mirrors the owner's approved compact horizontal arrangement, with separate worker, delivery and failure bands. Existing operational node IDs are preserved. The overview explains setup; short section notes explain the adjacent operations.

## Revision scope

Updated canvas geometry and annotations; configurable `n8nBaseUrl`; disabled-by-default email; consistent filtering across email counts, body and resource-change CSV; before/after metadata returned by the comparison query for safe key classification. Full inventory and change history remain available. Added a documentation note around the existing shared BigQuery worker.

No credentials, personal account/project configuration, workflow instance IDs, webhooks or execution samples are embedded in this JSON. Example configuration values must be replaced before running. Published repository files do not submit a Creator Portal revision.
