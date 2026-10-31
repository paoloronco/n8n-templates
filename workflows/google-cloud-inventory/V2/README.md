# Audit Google Cloud inventory and IAM changes with BigQuery and Sheets

**Template revision: v2.1.0 · 2026-10-30 — multiproject inventory.**

Inventory resources and visible IAM policies across an explicit list of Google Cloud projects, compare completed snapshots in one central BigQuery dataset, and review the results in Google Sheets. The dashboard has five tabs, three filterable tables, review checkboxes, notes and four charts. HTML/CSV exports and optional SMTP digests complete delivery.

**Support & customization:** [info@paoloronco.it](mailto:info@paoloronco.it) · [paoloronco.it](https://paoloronco.it).

## Downloads and guides

- [Workflow JSON](./google-cloud-inventory-workflow.json) — sanitized, inactive 49-node template, including six documentation notes.
- [Full setup and technical documentation](https://paoloronco.notion.site/Google-Cloud-Inventory-Change-Audit-408f0ba27c3281aea226fecadfab05f8?pvs=73).
- [Step-by-step setup guide](https://paoloronco.notion.site/Setup-Configuration-408f0ba27c3281159afbf589df96e399) — Google Cloud, Sheets, n8n credentials, SMTP and validation.
- [Gumroad download](https://paoloronco.gumroad.com/l/googlecloud-inventorychange) — workflow JSON, setup guidance and links to the documentation and dashboard.
- [Gumroad delivery text](./gumroad-delivery.md) — the customer-facing delivery copy published with the downloadable workflow.
- [Copy the native Google Sheets dashboard](https://docs.google.com/spreadsheets/d/16uTQRgZSTN2GN2nE2giTPu2ZyfWONfvt5m5gkOIOgeY/copy) — public model with synthetic examples. Your editable copy is the intended integration; use its spreadsheet ID.

## What the user configures and what the workflow creates

Importing the JSON and creating a service account alone is not enough. Complete the prerequisites once; there is no SQL schema to run manually for a fresh installation.

| Component | User configures before running | Workflow creates or updates |
| --- | --- | --- |
| Projects and billing | Choose the projects to scan and a central `billingProject` for BigQuery jobs, storage and Cloud Asset quota. Arrange billing for the intended workload. | No projects or billing accounts; no discovery of every project belonging to a Google login. |
| Identity and access | Create a service account/approved JSON key, store it in n8n credentials, and grant the access below. | No accounts, keys, roles or IAM grants. |
| APIs | Enable Cloud Asset API in `billingProject`, BigQuery API in the BigQuery/credential projects as applicable, and Sheets API in the Sheets credential project. | No API enablement. |
| BigQuery | Set `billingProject`, dataset ID and location; grant dataset creation, job and table permissions. Existing datasets must have the expected location/schema. | Central dataset and `inventory_resources_v2`, `inventory_runs_v2`, `inventory_changes_v2`, `inventory_findings_v2`, using create-if-missing setup. Tables are not created in every scanned project. |
| Google Sheets | Copy the native model, keep Dashboard/Inventory/Findings/Changes/Scans and their headers, and share the copy as Editor with the Sheets identity. | Data, table formatting, charts and scan rows in that existing spreadsheet; no new spreadsheet file or missing tabs. |
| n8n | Import into a new workflow, choose credentials in all ten HTTP nodes, fill Configuration, execution-link host, timezone and an Error Workflow. | The `gcp_inventory_template_runs` Data Table and run/delivery records. |
| Email and schedule | Configure SMTP, sender and recipient if `sendEmail=true`; validate manually, then publish to enable the daily schedule. | Conditional digests when enabled. No Cloud Run, VM, container, Cloud Scheduler or separate collector deployment is needed. |

Use an n8n release supporting the supplied node versions: Data Table, HTTP Request 4.2, Code 2 and Send Email 2.1. No usable credentials are included; the SMTP slot is a null placeholder.

### Required access

- On **every listed project** (or the one folder/organization scope): `cloudasset.assets.searchAllResources` and `cloudasset.assets.searchAllIamPolicies`, for example through `roles/cloudasset.viewer`. Grant at each project or a suitable common parent. The service account's own project does not grant access to other projects.
- On **`billingProject`**, which the two Cloud Asset nodes send as `x-goog-user-project`: `serviceusage.services.use`, for example `roles/serviceusage.serviceUsageConsumer`, with Cloud Asset API enabled there.
- On the **central BigQuery project**: `bigquery.jobs.create` and `bigquery.datasets.create`, plus the dataset/table read, create and update permissions used by setup and SQL persistence. A typical predefined-role setup is BigQuery Job User plus BigQuery Data Editor at project level. Dataset-level Data Editor alone cannot create a missing dataset. Setup attempts dataset creation and accepts an existing-dataset response; existing datasets still need matching location and schema.
- On **your spreadsheet copy**: a file-level Editor share for the Sheets identity, plus Google credentials with the relevant API scopes. Cloud IAM alone does not share a Drive file. The guide covers `cloud-platform`/BigQuery and `spreadsheets` scopes and separate Google credentials if desired.

For one Google service-account credential handling all ten HTTP nodes, enable HTTP Request use and enter these OAuth scopes as one comma-separated value:

```txt
https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/spreadsheets
```

With separate credentials, use `cloud-platform` for Cloud Asset/BigQuery and `spreadsheets` for the Sheets nodes.

See Google's [Cloud Asset permissions](https://docs.cloud.google.com/asset-inventory/docs/roles-permissions) and [BigQuery dataset creation permissions](https://docs.cloud.google.com/bigquery/docs/datasets). Use the detailed guide to match your organization's policies.

## Configure multiple projects

Edit the existing Configuration JSON, retaining its other fields:

```json
{
  "scopes": [
    "projects/your-first-project-id",
    "projects/your-second-project-id"
  ],
  "billingProject": "your-reporting-project-id",
  "dataset": "cloud_inventory",
  "location": "EU",
  "sheetId": "YOUR_SPREADSHEET_ID",
  "emailTo": "recipient@example.com",
  "emailFrom": "n8n@example.com",
  "sendEmail": true,
  "notifyEveryRun": false
}
```

This is a partial example, not a replacement for the full Configuration node. Use project IDs, not display names. The array accepts 1–100 entries, removes identical duplicates and sorts them. Multiple distinct scopes must all be projects. To cover a whole folder or organization, use one entry such as `folders/123456789` or `organizations/123456789`; do not mix it with overlapping projects. Legacy single `scope` remains accepted when `scopes` is absent.

Projects are explicitly configured. Adding a new project to a Google account does not add it to this workflow. Add it to `scopes` and grant the service account read access. A single folder/organization scope can include its visible descendants. Resource metadata and selected IAM bindings are searched separately for every configured scope, then consolidated centrally.

The first completed scan establishes a baseline. The sorted scope list is part of the comparison profile: adding/removing a project, changing normalization rules or upgrading from the old profile starts a fresh compatible baseline, avoiding false removals. Reordering the same list does not reset it. BigQuery keeps earlier history.

## First run and activation

1. Import the JSON into a **new, inactive** workflow; confirm 49 nodes. Importing over an existing canvas can append nodes.
2. Complete the manual prerequisites above, select Google credentials in all ten HTTP nodes, and SMTP credentials in Email digest when used.
3. Replace Configuration placeholders and `https://n8n.example.com` in Initialize run. Review governance rules and limits. Select your own Error Workflow in Settings; confirm the timezone and one-hour timeout. The portable default is Europe/Rome, with a daily trigger at 03:15 in that timezone.
4. Run a manual baseline. Confirm all configured projects appear as expected, all resource pages were collected, IAM status is `COMPLETE`, the four BigQuery tables exist and the Sheets tabs/charts/reports update. Resource search failure stops the inventory; incomplete IAM is shown as `UNAVAILABLE`, not a clean assessment.
5. Run a second scan with the same list. Check the previous-run comparison, review checkboxes/notes, delivery and native error handling. Then publish to activate scheduling.

`sendEmail=false` skips digest delivery while preserving Sheets and exports. Valid sender/recipient strings remain required by the validator. `notifyEveryRun=false` alone still allows conditional digests, including the initial baseline. Independent installations should use distinct registries and BigQuery datasets/spreadsheets as appropriate.

## Limits and operations

- `maxPages` applies to each resource/IAM search; asset, payload and Sheets limits apply to the consolidated run. The supported 100-scope configuration limit does not guarantee that a large environment fits those limits or finishes within the timeout.
- BigQuery storage and queries may incur charges. `maxBytesBilled` caps each query job, not total workflow spend. Retention is a separate configuration decision. Existing table schemas are not migrated automatically.
- Full changes remain in BigQuery; `reportChangeLimit` limits the displayed/exported change rows. Preserve sheet headers and hidden identifiers. Reviews/notes are restored by stable IDs, not a permanent review archive.
- Coverage depends on Cloud Asset supported types, API visibility and effective permissions. Findings require review. The workflow does not remediate resources or provide a complete vulnerability, usage, cost or compliance assessment.
- The publication JSON contains placeholders and public guide/model links, with no private project list, credential IDs, recipients or instance metadata. Configure and acceptance-test your own installation before enabling schedules.

## Changelog

- **v2.1.0:** explicit multiproject resource/IAM fan-out; central BigQuery/Sheets delivery; scope-aware baseline profile; complete-pagination checks across all scopes; explicit Cloud Asset quota project; digest disable switch; Sheets write ranges grow beyond the model's initial row count. Setup docs distinguish manual provisioning from automatic dataset/table/registry creation.
- **v2.0.1:** single-scope v2 release. Existing history is retained, with a fresh baseline under the v2.1.0 profile.
- [V1](../V1/README.md): original project-discovery workflow, preserved separately.
