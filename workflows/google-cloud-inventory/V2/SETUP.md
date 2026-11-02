# Set up Google Cloud Inventory & Change Audit

This guide covers the v2.2.0 multiproject template. For the illustrated walkthrough, use the [full setup guide](https://paoloronco.notion.site/Setup-Configuration-408f0ba27c3281159afbf589df96e399).

## 1. Prepare the projects and Google identity

Choose one central reporting project for the service account, API quota, BigQuery dataset and jobs. Record its project ID as `billingProject`, then choose the project IDs to inventory in `scopes`. The workflow does not discover every project belonging to your personal Google account.

Create a dedicated service account and approved authentication material, then store it in n8n's Google service-account credential. Do not paste keys into workflow nodes or commit them to source control.

Enable the APIs before running:

- Cloud Asset API in `billingProject` and the inventory credential project as applicable.
- Service Usage API in the credential project used by **Read enabled APIs**.
- BigQuery API in the reporting/credential projects as applicable.
- Google Sheets API in the Sheets credential project.

Grant access to the service account:

| Destination | Required access |
| --- | --- |
| Every scanned project | `cloudasset.assets.searchAllResources`, `cloudasset.assets.searchAllIamPolicies` and `serviceusage.services.list`. A predefined-role setup uses `roles/cloudasset.viewer` plus `roles/serviceusage.serviceUsageViewer`; an approved custom role can be narrower. |
| `billingProject` | `serviceusage.services.use`, for example Service Usage Consumer. The Cloud Asset requests explicitly use this quota project. |
| Central BigQuery project | Job creation, dataset creation and table read/write access. BigQuery Job User plus project-level BigQuery Data Editor supports the supplied create-if-missing setup. Dataset-only grants cannot create a missing dataset. |
| Your spreadsheet copy | File-level Editor share with the Sheets identity. Google Cloud IAM does not share a spreadsheet. |

No Project Owner or basic Editor role is required for the workflow identity. An administrator can provision access without granting the workflow permission to administer IAM or enable APIs.

## 2. Copy the dashboard

[Make an editable copy of the public Google Sheets model](https://docs.google.com/spreadsheets/d/16uTQRgZSTN2GN2nE2giTPu2ZyfWONfvt5m5gkOIOgeY/copy), share that copy with the Sheets service account as Editor and record its spreadsheet ID. Keep Dashboard, Inventory, Findings, Changes and Scans.

The model contains synthetic examples. The first successful run replaces the managed data, rebuilds charts/formatting and writes the 12-column Inventory layout. It does not create a spreadsheet or missing tabs. Preserve existing headers and hidden identifiers when upgrading a populated sheet; the workflow needs them to restore review checkboxes and notes.

## 3. Import and select credentials

Import [the JSON](./google-cloud-inventory-workflow.json) into a new, inactive workflow and confirm **51 nodes**, including six documentation notes. Use n8n with Data Table support and the supplied node versions. Importing into an existing populated canvas can append nodes.

Enable HTTP Request use on the Google service-account credential. For one account handling all Google requests, configure these OAuth scopes as one comma-separated value:

```text
https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/spreadsheets
```

Select the credential in all **eleven** Google HTTP Request nodes. In particular, configure **Read enabled APIs**, which is new in this version. With separate identities, use `cloud-platform` for Cloud Asset, Service Usage and BigQuery, and `spreadsheets` for the four Sheets nodes.

If your credential has an Allowed HTTP Request Domains list, permit the relevant endpoints: `cloudasset.googleapis.com`, `serviceusage.googleapis.com`, `bigquery.googleapis.com` and `sheets.googleapis.com`. OAuth scopes do not replace IAM grants or spreadsheet sharing.

## 4. Fill the Configuration node

Edit the existing JSON and keep its other defaults and limits. Set:

- `scopes`: 1–100 entries such as `projects/your-project-id`; multiple entries must be distinct projects. Duplicates are removed and the list is sorted.
- `billingProject`, `dataset` and `location`: the central reporting project, dataset ID and BigQuery location. Existing datasets must have the expected schema/location.
- `sheetId`: your own copied spreadsheet ID.
- `emailTo`, `emailFrom` and `sendEmail`: valid addresses remain required; set `sendEmail=false` for testing without digests.
- Governance rules and limits appropriate to your environment.

Replace `https://n8n.example.com` in **Initialize run** with your own instance URL. Configure SMTP in **Email digest** if used. Select an Error Workflow in n8n Settings, confirm the timezone and schedule, and keep the one-hour timeout or adjust it deliberately. The portable default is 03:15 Europe/Rome.

A single folder/organization scope remains supported. Service Usage is queried per descendant project inferred from Cloud Asset results; grant list access on those projects too. No visible descendant project stops the run. Explicit project scopes are preferable when you need a fixed list.

## 5. Understand the automatic setup

On the first execution, the supplied template creates the central dataset and these tables if missing:

- `inventory_resources_v2`
- `inventory_runs_v2`
- `inventory_changes_v2`
- `inventory_findings_v2`

It also creates the `gcp_inventory_template_runs` n8n Data Table and updates your existing spreadsheet. No manual SQL is required for a fresh installation. Existing BigQuery schemas are not migrated automatically.

You prepare service accounts, credentials, API enablement, IAM grants, the spreadsheet copy and optional SMTP. The workflow does not create those items or deploy a Cloud Run service, VM, Cloud Scheduler job or separate collector.

## 6. Run twice before scheduling

Run **Manual start**. Confirm resource and Service Usage pagination completed, IAM status is `COMPLETE`, all configured projects appear, BigQuery tables exist, and the five Sheets tabs and report files update.

The dashboard separates **Workloads & data** from **Total inventory**. APIs, networks, identities, versions and configuration remain visible in their own categories. This classification describes record purpose; it does not prove activity, cost or whether a resource can be deleted.

Mark an unchanged resource Verified, add a note and run again with the same scopes. Confirm those fields persist and the comparison uses the previous completed run. Natural cloud changes can still appear. Publish only after checking delivery and the error handler.

## Upgrade an existing installation

Export a backup of your existing workflow. Add Service Usage API access, `serviceusage.services.list` on every scanned project and the credential domain above. Import into an inactive workflow, retain your own configuration, dataset/location, registry, spreadsheet and execution-link host, and reselect credentials in all eleven HTTP nodes. Keep only one scheduled writer for each destination.

Keep the sheet's old headers and identifiers until the first successful upgrade run; do not manually insert Category. Review fields are matched by header and stable ID and rewritten into the new 12-column layout. The changed API source starts a `canonical_v3_live_services` baseline, with earlier BigQuery history retained. Run a second time to validate comparison and review preservation before scheduling.

For HTTP 403 in **Read enabled APIs**, check the API enablement in the credential project, `serviceusage.services.list` on the target project and the credential domain allowlist. Do not bypass pagination or permission errors to publish a partial inventory. BigQuery queries/storage can incur charges; review configured limits, quotas and retention.

References: [Service Usage list](https://docs.cloud.google.com/service-usage/docs/reference/rest/v1/services/list), [Cloud Asset permissions](https://docs.cloud.google.com/asset-inventory/docs/roles-permissions), [n8n service-account setup](https://docs.n8n.io/integrations/builtin/credentials/google/service-account/).
