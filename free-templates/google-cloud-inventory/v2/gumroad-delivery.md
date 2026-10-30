# Google Cloud Inventory & Change Audit

Thank you for downloading this workflow! Inventory resources across one or multiple Google Cloud projects, track changes over time, and review IAM policies in one Google Sheets dashboard, with history stored centrally in BigQuery.

## Download & Resources

Download the workflow JSON attached to this page, then use these resources to set up your installation:

- [Setup guide and complete documentation](https://paoloronco.notion.site/Google-Cloud-Inventory-Change-Audit-408f0ba27c3281aea226fecadfab05f8?pvs=73) — service accounts, APIs, permissions, n8n credentials, configuration and troubleshooting.
- [Make a copy of the Google Sheets dashboard](https://docs.google.com/spreadsheets/d/16uTQRgZSTN2GN2nE2giTPu2ZyfWONfvt5m5gkOIOgeY/copy) — create your own editable copy of the model, which contains synthetic example data.
- [GitHub repository](https://github.com/paoloronco/n8n-templates) — workflow source files, README and updates.

## What's Included

- An importable n8n workflow for resource inventory and IAM policy scanning across your configured projects.
- Central BigQuery storage for snapshots, scan history, changes and findings.
- A Google Sheets dashboard with five tabs: Dashboard, Inventory, Findings, Changes and Scans.
- Review checkboxes and notes preserved between scans using stable identifiers.
- HTML and CSV reports available from the **Report files** node after a completed execution.
- Optional email digests and a configurable daily schedule.

## Getting Started

1. **Copy and share the dashboard.** Use the Google Sheets link above, keep all five tabs and their headers, and share your copy as Editor with the service account that will write to Sheets.
2. **Prepare Google Cloud.** Create your service account, enable the required APIs, and grant inventory and IAM read access on every project you want to scan. Choose one central project for BigQuery and grant the dataset, table and query permissions described in the guide.
3. **Import and connect the workflow.** Import the supplied JSON into a new n8n workflow. Configure your Google credentials and assign them to the Google HTTP Request nodes as shown in the setup guide.
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

## Support & Updates

For setup questions or customization, contact [info@paoloronco.it](mailto:info@paoloronco.it). Source files and updates are available in the [GitHub repository](https://github.com/paoloronco/n8n-templates).

Created and maintained by [Paolo Ronco](https://paoloronco.it).
