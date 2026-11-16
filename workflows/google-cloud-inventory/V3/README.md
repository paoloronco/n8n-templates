# Audit Google Cloud inventory and IAM across multiple projects

## Description

### Quick overview

Inventory Google Cloud resources and IAM policies across multiple projects. Discover accessible projects, collect resource metadata from Cloud Asset Inventory and native Google APIs, track changes in BigQuery, and review findings in an eight-tab Google Sheets dashboard. Export HTML/CSV reports and receive optional email notifications when resources are added or removed.

### How it works

1. **Start the scan** manually or on a daily schedule at 03:15.
2. **Discover accessible projects** using Cloud Resource Manager, including configured fallback projects when necessary.
3. **Collect resources** through Cloud Asset Inventory, Service Usage and native Google APIs for IAM, API Keys, Cloud Storage, BigQuery, Firestore and Cloud Scheduler.
4. **Assess IAM and governance** by checking public access, broad IAM roles, privileged service accounts, missing labels and location policies.
5. **Store snapshots in BigQuery** and compare them with the previous compatible scan to identify added, modified and removed resources.
6. **Update Google Sheets** with inventory, findings, changes, scan history and coverage details. Preserve review checkboxes, notes and finding statuses between runs.
7. **Generate HTML/CSV reports** and optionally email a digest with CSV attachments when resources are added or removed. Record execution and delivery status in an n8n Data Table.

### Setup

1. **Prepare BigQuery.** Create a dataset in your reporting project and grant the required job and table permissions.
2. **Configure Google Cloud access.** Enable the required APIs and grant the service account read permissions for Cloud Resource Manager, Cloud Asset Inventory, Service Usage and the native services being inventoried.
3. **Prepare Google Sheets.** [Copy the dashboard template](https://docs.google.com/spreadsheets/d/16uTQRgZSTN2GN2nE2giTPu2ZyfWONfvt5m5gkOIOgeY/copy), keep the required tabs and share it with your Google credentials.
4. **Configure n8n.** Import the workflow, connect Google credentials to the HTTP Request nodes and update the Configuration node with your project settings, dataset, spreadsheet ID and scan limits.
5. **Configure notifications.** Set your SMTP credentials and sender/recipient addresses, or disable email with `sendEmail=false`.
6. **Test the workflow.** Run two manual scans to verify the baseline, BigQuery history, Google Sheets updates and IAM coverage before enabling the schedule.

### Requirements

- n8n with Data Table support.
- Google Cloud project with BigQuery enabled.
- Google service account with the required API access and IAM permissions.
- Google Sheets spreadsheet with Editor access for the connected identity.
- SMTP credentials (optional).

### Customization

- Adjust project scopes, discovery fallbacks and inventory limits.
- Configure required resource labels and allowed locations.
- Add documented IAM exceptions for accepted configurations.
- Change the scan schedule and email notification settings.
- Customize the Google Sheets dashboard and reporting output.

### Additional info

- The dashboard contains eight tabs: Dashboard, Inventory, Findings, Changes, Scans, Enabled APIs, Technical resources and Coverage.
- The first scan creates a baseline; subsequent scans track changes. Incomplete inventory discovery stops the run rather than reporting missing resources as deletions.
- IAM findings support `OPEN`, `ACCEPTED`, `RESOLVED` and `UNVERIFIED` statuses.
- The workflow does not modify IAM permissions, delete resources or inspect application data.

**Documentation:** [GitHub](https://github.com/paoloronco/n8n-templates/tree/main/workflows/google-cloud-inventory/) · [Setup guide](https://paoloronco.notion.site/Setup-Configuration-408f0ba27c3281159afbf589df96e399)

**Support:** [info@paoloronco.it](mailto:info@paoloronco.it)