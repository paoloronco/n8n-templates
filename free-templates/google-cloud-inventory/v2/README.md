# Audit Google Cloud inventory and IAM changes with BigQuery and Sheets

**Template revision:** v2.0.1 · 2026-10-30. The main workflow note includes the setup guide and public support contact.

**Support & customization:** [info@paoloronco.it](mailto:info@paoloronco.it) · [paoloronco.it](https://paoloronco.it).

Inventory Google Cloud resources, assess visible IAM policies and governance rules, and compare completed BigQuery snapshots. Review the latest results in Google Sheets with five tabs, three filterable tables, review checkboxes, conditional formatting and four charts.

## Get started

- [Full setup and technical documentation](https://paoloronco.notion.site/Google-Cloud-Inventory-Change-Audit-408f0ba27c3281aea226fecadfab05f8?pvs=73)
- [Gumroad download and delivery page](https://paoloronco.gumroad.com/l/googlecloud-inventorychange)
- [Copy the native Google Sheets dashboard](https://docs.google.com/spreadsheets/d/16uTQRgZSTN2GN2nE2giTPu2ZyfWONfvt5m5gkOIOgeY/copy)
- [Workflow JSON](./google-cloud-inventory-workflow.json)

The public Sheets model is view-only and contains synthetic examples. Create your own editable copy and use its spreadsheet ID. The XLSX workbook is available through Gumroad; the native Sheets copy is the intended integration.

## Files

| File | Purpose |
| --- | --- |
| [google-cloud-inventory-workflow.json](./google-cloud-inventory-workflow.json) | Sanitized, unpublished 47-node n8n template, including six documentation notes. |
| [README.md](./README.md) | Overview, prerequisites and quick setup. |

## What it does

1. Runs manually or daily at 03:15 in the configured workflow timezone.
2. Validates configuration and tracks scan/delivery status in an n8n Data Table.
3. Collects paginated resource metadata and selected IAM policy bindings through Cloud Asset Inventory.
4. Checks public access, broad Owner/Editor roles, required labels and allowed locations, and reports incomplete IAM coverage explicitly.
5. Persists snapshots/findings in BigQuery, validates jobs and compares only completed compatible baselines.
6. Updates Dashboard, Inventory, Findings, Changes and Scans, restoring review flags and notes by stable identifiers.
7. Exposes downloadable HTML/CSV reports and sends conditional SMTP digests. Native n8n Error Workflows handle automatic failure notifications.

The first completed scan establishes a baseline without treating every existing resource as newly added. BigQuery keeps full change details; displayed change rows are limited by reportChangeLimit.

## Requirements

- An n8n release supporting the node versions in the JSON, including Data Table, HTTP Request 4.2, Code 2 and Send Email 2.1.
- Google Cloud Asset Inventory, BigQuery and Google Sheets APIs, with appropriate API consumer access.
- A service account with Cloud Asset read access on the intended scope, BigQuery job/data permissions, and Editor access to your own spreadsheet copy.
- Google API credentials configured for HTTP Request use with the documented scopes.
- SMTP credentials and an allowed sender for the standard digest branch, or the coordinated email-free customization described in the guide.

## Quick setup

1. Download the JSON and import it into a **new** n8n workflow. Keep it unpublished during setup.
2. Copy the Sheets dashboard and share your copy as Editor with the account used by the Sheets HTTP nodes.
3. Follow the [Google Cloud and service-account setup guide](https://paoloronco.notion.site/Google-Cloud-Inventory-Change-Audit-408f0ba27c3281aea226fecadfab05f8?pvs=73) for APIs, IAM grants, JSON key handling, BigQuery location and credential scopes.
4. Select the intended Google credentials in all ten HTTP nodes and your SMTP credential in Email digest. The SMTP slot is only a null placeholder; no usable account is included.
5. In Configuration, replace scope, billingProject, dataset, location, sheetId, emailTo and emailFrom. Review governance rules and limits. Replace https://n8n.example.com in Initialize run with your own n8n base URL.
6. In Settings, confirm timezone, the one-hour timeout and your own Error Workflow. The portable JSON specifies Europe/Rome; verify the setting after import.
7. Run a manual baseline and a second scan. Verify counts, IAM coverage, Sheets reviews, reports and delivery before publishing to enable scheduling.

The run registry is created as gcp_inventory_template_runs. Use distinct registries and destinations for independent installations.

## Operational notes

- **Email:** notifyEveryRun=false keeps conditional digests; it does not disable email. The first baseline normally sends a digest.
- **Costs:** BigQuery query processing and retained snapshots can incur charges. maxBytesBilled applies per query job, not to total workflow spend. Configure retention explicitly.
- **Workbook contract:** keep tab names, headers and hidden identifiers intact. Verified/Reviewed and Notes are restored for stable IDs; they are not automatic remediation or a permanent review archive.
- **Coverage:** searchable metadata and visible IAM policies depend on effective permissions. This is not a complete vulnerability, cost or compliance assessment.
- **Portability:** private credential references, project IDs, recipients, instance metadata and private dashboard links are absent. The main note includes the public documentation and Sheets-copy links.
- **Validation:** the publication copy was imported and inspected in n8n without execution against a recipient's environment. Complete the documented acceptance tests with your own credentials.

## Versions

- **v2:** this folder — scoped inventory, IAM findings, BigQuery history, Google Sheets dashboard and delivery.
- [Legacy v1](../README.md#legacy-v1-documentation): original project-discovery and BigQuery workflow, preserved separately from this release.
