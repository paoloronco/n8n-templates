# Google Cloud Inventory & Change Audit

Reusable Google Cloud inventory and change-audit workflows for n8n. **Start with v2** for IAM findings, a Google Sheets review dashboard, HTML/CSV reports and conditional email digests.

## Releases

| Version | Workflow | Documentation | Distribution |
| --- | --- | --- | --- |
| **v2 — current** | [Importable JSON](./v2/google-cloud-inventory-workflow.json) | [Quick setup](./v2/README.md) · [Complete guide](https://paoloronco.notion.site/Google-Cloud-Inventory-Change-Audit-408f0ba27c3281aea226fecadfab05f8?pvs=73) | [Gumroad](https://paoloronco.gumroad.com/l/googlecloud-inventorychange) |
| v1 — legacy | [Original JSON](./Google%20Cloud%20Inventory%20%26%20Change%20Audit.json) | [Legacy reference below](#legacy-v1-documentation) | Retained for existing installations. |

## Current release

The 47-node v2 template collects resources within a configured project, folder or organization scope, assesses selected IAM/governance controls, persists completed snapshots in BigQuery and updates a five-tab Google Sheets dashboard. The first successful scan establishes a baseline.

[Copy the Google Sheets model](https://docs.google.com/spreadsheets/d/16uTQRgZSTN2GN2nE2giTPu2ZyfWONfvt5m5gkOIOgeY/copy) and follow the [v2 README](./v2/README.md). Create your own editable spreadsheet and configure your own Google API/SMTP credentials before running.

The original v1 JSON stays at its existing path so existing download links continue to work. The versions have different configuration, table schemas and scope behavior; v2 is not an automatic migration of v1 history.

## Legacy v1 documentation

<details>
<summary>Expand the original v1 setup and reference</summary>

The reference below applies to the original JSON in this directory. Use the v2 links above for the current release.

**Full documentation:** [Google Cloud Inventory & Change Audit — Notion](https://www.notion.so/402f0ba27c32801ba303f2549dbe9fa2)

> **Need help deploying this workflow?** For managed setup, Google Cloud IAM and BigQuery configuration, troubleshooting, or consulting, contact [info@paoloronco.it](mailto:info@paoloronco.it) or visit [paoloronco.it](https://paoloronco.it).

---

## Quick overview

Automatically discover accessible Google Cloud projects, collect supported resource metadata with Cloud Asset Inventory, and store historical snapshots in BigQuery. Compare completed scans to detect added, modified, and removed resources. Includes scheduled execution, Service Account authentication, and snapshot integrity checks.

## How it works

- Start the workflow manually or on a configurable daily schedule.
- Initialize the BigQuery dataset and inventory tables.
- Discover organizations, folders, and active projects visible to the Service Account.
- Collect supported resources from each project through Cloud Asset Inventory, with pagination.
- Normalize metadata and validate each project's snapshot.
- Store snapshots and compare them with the previous completed scan using a BigQuery transaction.
- Record added, modified, and removed resources, then verify completion.

The first completed scan establishes a baseline. It does not report all existing resources as newly added.

## Requirements

- An n8n instance supporting HTTP Request, Code, Edit Fields, Schedule Trigger, Manual Trigger, and Loop Over Items.
- A Google Cloud project for BigQuery storage.
- A dedicated Google Cloud Service Account with read access to the intended projects.
- Cloud Resource Manager, Cloud Asset Inventory, and BigQuery APIs enabled.
- Permissions to use BigQuery and access or provision the inventory dataset.

## Setup

- Import the workflow JSON into n8n and leave it inactive during setup.
- Enable Cloud Resource Manager API, Cloud Asset API, and BigQuery API in the relevant Google Cloud project.
- Create a dedicated Google Cloud Service Account.
- Grant Browser and Cloud Asset Viewer on the target projects or their shared folder or organization.
- Grant BigQuery Job User on the storage project and BigQuery Data Editor, preferably on the inventory dataset.
- Create the BigQuery dataset in advance, or provide the additional permission required for automatic dataset creation.
- Configure a Google Service Account API credential in n8n with HTTP Request support and the `cloud-platform` OAuth scope.
- Select that credential in every HTTP Request node.
- Enter the BigQuery storage Project ID in the Configuration node; other fields have defaults.
- Run the workflow manually, verify the discovered projects and BigQuery results, then enable the schedule.

No custom IAM roles or manual lists of target projects are required. Project discovery depends on the Service Account's effective permissions.

## Output

- **Resources:** Historical Google Cloud asset snapshots and normalized metadata.
- **Scan runs:** Completed scans, project scopes, timestamps, and resource counts.
- **Changes:** Added, modified, and removed resource events between completed snapshots.

## Customization

- Adjust the scan frequency in the Schedule Trigger.
- Change the BigQuery dataset, location, or pagination limits in Configuration.
- Expand project coverage by granting the Service Account access to additional projects.
- Configure a separate n8n Error Workflow for failure notifications.
- Apply dataset-level BigQuery permissions and appropriate data retention settings.

## Additional info

- **Storage:** BigQuery tables `resources`, `scan_runs`, and `changes` are created or checked by the workflow.
- **Safety:** A BigQuery transaction validates each snapshot before recording it as complete.
- **Limits:** Up to 5 MiB of normalized resource metadata per project, with a separate 9 MiB request-size guard.
- **Failure behavior:** Errors stop the workflow; independent continuation after a failed project is not implemented.
- **Coverage:** Only accessible, Cloud Asset Inventory-supported resource types are included.
- **Validation:** Tested with six accessible projects and 687 resources, with matching snapshot counts and no historical duplicate keys in the checked runs.
- **Remaining tests:** Real added/modified/removed resource lifecycle, injected API failures, and near-limit payloads have not been fully validated.
- **Security:** Keep Service Account private keys and actual infrastructure inventory data out of public exports.

## Official resources

- [n8n Google Service Account credentials](https://docs.n8n.io/integrations/builtin/credentials/google/service-account/)
- [Google Cloud Asset Inventory](https://cloud.google.com/asset-inventory/docs/search-resources)
- [BigQuery access control](https://cloud.google.com/bigquery/docs/access-control)

</details>
