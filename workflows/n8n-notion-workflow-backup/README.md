# n8n Workflow Backup to Notion · V3

Back up the workflows visible to your n8n API account into a structured Notion catalog. The companion setup workflow creates the page, inline database, 14 typed columns and a restore guide automatically. Each workflow row contains readable English documentation and one complete, verified JSON attachment.

## How it works

1. The main workflow calls **Ensure Notion catalog**. The companion discovers and reuses the dedicated catalog, or creates it beneath a page you shared with your Notion integration.
2. The backup follows n8n API pagination and includes active, inactive and archived workflows by default. Permissions determine which workflows the API can see.
3. Each n8n workflow ID maps to one stable Notion row. Its status, trigger types, tags, links and export information are updated.
4. The workflow generates native Notion documentation with Quick overview, How it works, Setup, Customization and Additional info sections. It preserves recognized personal edits and the Notes property.
5. A complete formatted JSON file is uploaded directly to the row. The saved attachment is downloaded and checked against the expected bytes and SHA-256 before an older managed file is retired.
6. Requests are paced; retries are bounded. Incomplete coverage or verification remains a failed backup. Missing source workflows keep their last backup with an Unavailable status.

## Setup

1. Import **setup-notion-catalog.json** into n8n. Select your Notion integration credential in **Notion setup API**, then save the workflow. It can remain inactive: the main workflow calls it directly.
2. Import **workflow.json** as the main workflow. Keep its schedule inactive while configuring it.
3. Select an n8n API credential in **n8n API · read only**. It needs workflow read/list and execution read/list permissions; workflow create, update and delete permissions are unnecessary.
4. Select the same Notion integration in **Notion API · snapshots & audit** and **Upload complete JSON file**. The integration needs read, insert and update content capabilities and file-upload access.
5. Create or choose one parent page in Notion and connect the integration to it. You do not need to create a database or any columns yourself.
6. Edit the main **Configuration** node: set `setupWorkflowId` to the imported companion's ID, `notionParentPageId` to the shared parent page ID, and `n8nOrigin` / `n8nApiBase` to your instance URLs. The helper ID appears after `/workflow/` in its n8n URL. Use the parent page's UUID, not a database or view ID.
7. Leave `documentationDataSourceId` empty for a new catalog. Choose a stable `catalogTitle`; reruns reuse that exact page and its Workflows database. Run initial setup sequentially for each parent/title combination.
8. Run the main workflow manually. Open the created Notion catalog, inspect a row and download its JSON. Run again to confirm that pages and attachments are reused.
9. Configure binary storage and execution retention for your deployment. Adjust the schedule and time zone, then activate the main workflow.

Email is optional. With `notifyOnErrors` and `notifyOnChanges` set to `false`, no SMTP credential is needed. To enable email, configure **Send backup email**, sender/recipient addresses and notification flags. An independent n8n error workflow can be configured separately.

The overview and **02 · Create or reuse the catalog** section describe automatic setup. Source discovery, API dispatch, attachment verification and final outcomes are grouped separately on the canvas.

### Upgrade an existing catalog

Import the companion and select its ID in the main configuration. Set `documentationDataSourceId` to the existing data source ID, and keep the corresponding parent in `documentationRootPageId` if provided. A data source ID may differ from the database ID. The setup adds missing compatible properties, preserves extra properties and existing content, and stops on conflicting property types. It does not create a second catalog or rewrite existing status options. Rename legacy properties to the exact names below before adopting a catalog with a different schema.

The first successful V3 verification fills the added export columns. Existing catalogs retain their current page structure; the automatic restore-guide subpage is created for newly provisioned catalogs.

## Catalog columns

| Property | Type | Meaning |
| --- | --- | --- |
| Name | Title | Saved n8n workflow name. |
| ID | Text | Stable workflow identity used for matching. |
| Status | Select | Active, Active · scheduled, Inactive, Scheduled · inactive, Archived or Unavailable. |
| Trigger | Multi-select | Enabled Schedule, Manual, Error, Sub-workflow, Chat, Webhook or App trigger nodes. |
| Workflow link | URL | Direct link to the source workflow. |
| Updated at | Date | Source workflow's saved update time, normalized to Notion's minute precision. |
| Notes | Text | Your own notes; the backup never overwrites them. |
| Node count | Number | All nodes except sticky notes, including disabled processing nodes. |
| Tags | Multi-select | Source workflow tag names. |
| Active | Checkbox | Source n8n activation flag. |
| Archived | Checkbox | Source n8n archive flag. |
| JSON bytes | Number | UTF-8 byte length of the verified JSON attachment. |
| JSON SHA-256 | Text | SHA-256 of the complete attached export. |
| Backup saved at | Date | Time this export was first accepted, or its metadata was initialized. Unchanged verification keeps this value. |

The Workflows database is embedded in its catalog page. Each row is a workflow page containing the README and JSON attachment. A separate **Setup and restore** page explains first run and recovery. Add your own views, filters or grouping in Notion as needed.

## Customization

- Change `includeWorkflowIds` and `excludeWorkflowIds` to limit the scope. Leave the include list empty for the full visible inventory. Inactive workflows remain included; `includeArchived` controls archived workflows.
- Adjust request pacing, runtime budget and `notionMaxFileBytes` for your account. The default file allowance is 5 MiB; single-part uploads are limited to 20 MiB.
- Use `forceFullVerification: true` to download and verify every selected attachment. Otherwise unchanged workflows may use a cached verification for up to 24 hours. Metadata edits in Notion invalidate that shortcut.
- Improve English source sticky notes to improve generated documentation. Generation is deterministic and uses no AI service.
- Recognized secret literals are redacted by default; `secretPolicy: "block"` refuses those exports instead. This is a heuristic, not a guarantee that arbitrary workflow parameters contain no confidential data.

## Requirements

- n8n with public API access, HTTP Request v4.2, Code v2, Execute Sub-workflow v1.3 and its trigger, plus supported persistent binary storage.
- A Notion integration with access to the chosen parent page and the catalog it creates.
- Notion file-upload allowance sufficient for the selected exports.
- An SMTP account only when email notifications are enabled.

The nodes explicitly use `Notion-Version: 2026-03-11` and preserve header capitalization for compatibility with n8n's Notion credential handler. Keep **Send Body** enabled with **Using JSON** in the setup HTTP node; the body expression maps the prepared request payload.

## Restore

Download a workflow's complete `.json` attachment and import it into a separate inactive n8n workflow. Check the graph, reconnect credentials, restore redacted values where necessary and review URLs, webhooks and schedules before activation.

## Additional info

- This is a one-way workflow-definition backup from n8n to Notion. It is not a full n8n instance backup.
- Exports represent the latest saved definition, which may differ from the published revision. Encrypted credential secrets, the n8n database, encryption key, runtime files and pinned execution data require separate handling.
- Operational backups can retain source URLs, identifiers and credential references. Review them before sharing. The downloadable template itself has no credential bindings or private account configuration.
- The setup refuses ambiguous duplicate page/database names and incompatible column types. If a create response is lost, it reconciles the saved structure instead of blindly creating another copy. Initial setup is designed to run sequentially, not concurrently for the same catalog.
- Notion has request, content and upload limits. Oversized exports fail while preserving the previous backup; no external-storage fallback is included.
- The bundle contains two native n8n workflows. No AI account, cloud object-storage account or community node package is required.
