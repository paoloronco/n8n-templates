# Google Cloud Inventory & Change Audit

Thank you for downloading this workflow! Inventory resources across one or multiple Google Cloud projects, track changes over time, and review IAM policies in one Google Sheets dashboard, with history stored centrally in BigQuery.

## Download & Resources

Download the workflow JSON attached to this page, then use these resources to set up your installation:

- [Step-by-step setup guide](https://paoloronco.notion.site/Setup-Configuration-408f0ba27c3281159afbf589df96e399) — service accounts, APIs, permissions, n8n credentials, configuration and troubleshooting.
- [Make a copy of the Google Sheets dashboard](https://docs.google.com/spreadsheets/d/16uTQRgZSTN2GN2nE2giTPu2ZyfWONfvt5m5gkOIOgeY/copy) — create your own editable copy of the model, which contains synthetic example data.
- [GitHub source and README](https://github.com/paoloronco/n8n-templates/tree/main/workflows/google-cloud-inventory/V2) — workflow source files, README and updates.

## What's Included

- An importable n8n workflow for resource inventory and IAM policy scanning across your configured projects, with enabled API states read directly from Service Usage.
- Separate counts for workloads and data, enabled APIs, networking, identities, versions and configuration; the Category field is included in Sheets and HTML/CSV exports.
- Central BigQuery storage for snapshots, scan history, changes and findings.
- A Google Sheets dashboard with five tabs: Dashboard, Inventory, Findings, Changes and Scans.
- Review checkboxes and notes preserved between scans using stable identifiers.
- HTML and CSV reports available from the **Report files** node after a completed execution.
- Optional email digests and a configurable daily schedule.

## Getting Started

1. **Copy and share the dashboard.** Use the Google Sheets link above, keep all five tabs and their headers, and share your copy as Editor with the service account that will write to Sheets.
2. **Prepare Google Cloud.** Create your service account, enable Cloud Asset, Service Usage, BigQuery and Sheets APIs as described in the guide, and grant inventory, IAM and enabled-API read access on every project you want to scan. Choose one central project for BigQuery and grant the dataset, table and query permissions described in the guide.
3. **Import and connect the workflow.** Import the supplied JSON into a new n8n workflow. Configure your Google credentials and assign them to the Google HTTP Request nodes as shown in the setup guide, including **Read enabled APIs**. If you use a credential domain allowlist, include `serviceusage.googleapis.com` alongside the Cloud Asset, BigQuery and Sheets endpoints.
4. **Update Configuration.** Add each project to `scopes` and set `billingProject`, `dataset`, `location` and your own `sheetId`. Review the governance rules and scan limits, and replace the example n8n address in **Initialize run** with your instance URL.
5. **Choose your notifications.** Configure SMTP credentials and your sender/recipient addresses for email digests. Set `sendEmail=false` to skip digests during testing. Select an Error Workflow in n8n Settings if you want independent failure alerts.
6. **Test before scheduling.** Run **Manual start** to create the baseline, then run a second scan. Check BigQuery completion, IAM coverage, the five Sheets tabs and the generated reports. Confirm the workflow timezone and daily schedule before publishing it in n8n.

## What Is Created Automatically?

On first execution, the workflow creates the central BigQuery dataset and its four inventory/audit tables if they are missing, plus the n8n run registry. You do not need to run SQL manually for a fresh installation.

Each completed run updates your existing spreadsheet with inventory, findings, changes, scan history, formatting and charts. You prepare the Google Sheet copy, service account, API access, permissions and n8n credentials beforehand. The workflow does not create the spreadsheet or missing tabs.

No Cloud Run, VM or separate Google Cloud collector deployment is required.

## Important Notes

- Projects are selected explicitly in `scopes`; add each project and grant access before scanning it.
- The first scan establishes a baseline. Later scans compare against the previous compatible completed scan; earlier history remains in BigQuery.
- Coverage depends on Cloud Asset supported resource types and the permissions available to your service account. Review IAM coverage in the results.
- Use n8n with Data Table support. Review BigQuery usage, quotas, retention and the configured inventory limits before enabling scheduled runs.
- Findings require your review. This workflow reports on your environment; it does not change IAM permissions or delete resources.

## Updating an Existing Installation

Back up your workflow before importing. Keep your own project list, BigQuery dataset, registry, spreadsheet, credential selections and execution-link host. Add `serviceusage.services.list` on every scanned project and connect the Google credential to **Read enabled APIs**. Keep existing sheet headers and hidden identifiers: the workflow migrates Inventory to 12 columns and preserves matching review checkboxes and notes automatically.

The API source change starts a fresh comparison baseline while preserving earlier BigQuery history. Run twice and check categories, API states, IAM coverage, notes and delivery before enabling the schedule. Categories describe the purpose of records; they do not prove current use or identify resources that are safe to delete.

## Support & Updates

For setup questions or customization, contact [info@paoloronco.it](mailto:info@paoloronco.it). Source files and updates are available in the [GitHub source and README](https://github.com/paoloronco/n8n-templates/tree/main/workflows/google-cloud-inventory/V2).

Created and maintained by [Paolo Ronco](https://paoloronco.it).

