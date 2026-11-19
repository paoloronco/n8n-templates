# n8n Workflow Backup to Notion

## Documentation links

- [Full Notion documentation](https://paoloronco.notion.site/41af0ba27c32814d800cc4582aa68c04)

Maintain a Notion catalog of active, inactive and archived n8n workflows. Each page contains an English README and one complete JSON attachment. The sync verifies saved content, preserves personal notes and reports incomplete backups as failures.

## How it works

- Discover active, inactive and archived workflows through the n8n API.
- Match each workflow to one stable page in a dedicated Notion catalog.
- Generate readable English documentation from the workflow's notes and configured steps.
- Attach one complete, formatted JSON export directly to each workflow page.
- Download and verify the attachment before accepting a replacement or removing an older copy.
- Preserve personal notes and recognized documentation edits. Keep the last backup when a source workflow becomes unavailable.
- Process workflows sequentially with paced requests, bounded retries and a report that identifies incomplete backups.

## Setup

- Import the workflow into n8n and keep it inactive while configuring the integrations.
- Create an n8n API credential with permission to read workflows and executions, then select it in the n8n API node.
- Create a dedicated Notion page and database, share them with your integration, and select its credential in both Notion API nodes.
- Create these database properties with their exact names: `Name` (Title), `ID` (Text), `Status` (Select), `Trigger` (Multi-select), `Workflow link` (URL), `Updated at` (Date) and `Notes` (Text).
- Enter your Notion data source ID, parent page ID, n8n instance URL and API URL in **Configuration**. Use the data source ID associated with the database, which can differ from the database ID.
- Configure SMTP credentials and notification preferences if email reports are required. Otherwise, leave notifications off and disable the optional **Send backup email** node.
- Configure binary storage and execution retention for your deployment.
- Run a sync, inspect the generated documentation and download a JSON attachment before enabling unattended execution.
- Choose a schedule and time zone that suit your needs, then activate the configured workflow.

## Customization

- Adjust workflow inclusion, exclusions and archived-workflow handling in **Configuration**.
- Change the schedule, request pacing, runtime budget and file-size allowance to match your environment.
- Improve the English sticky notes in source workflows to make the generated documentation more useful.
- Add personal commentary to the **Notes** property or outside the managed documentation sections.
- Configure email notifications or an independent n8n error workflow to suit your monitoring preferences.

## Requirements

- An n8n instance with public API access and permission to read the workflows and executions being documented.
- A Notion workspace with a dedicated catalog database and an integration that can read, insert and update its content and upload files.
- A Notion upload allowance large enough for the workflow exports being backed up.
- Binary storage supported by your n8n deployment and sufficient capacity for attachments and execution data.
- An SMTP account only if you enable email notifications.

## Additional info

- Synchronization runs from n8n to Notion. Restore an exported workflow by importing its JSON into n8n.
- Exports represent the latest saved workflow definition, which may differ from the published version.
- Encrypted credential values and pinned data are excluded. Back up the n8n database, encryption key, credentials and runtime files separately.
- Operational exports can retain source URLs, identifiers and credential references. Review them before sharing outside your organization.
- Files that exceed the configured upload allowance produce an error and leave the previous backup intact.
- The workflow uses native n8n nodes and does not require an AI service, community node package or companion workflow.
