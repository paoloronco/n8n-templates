# n8n Workflow Backup to Notion

## Quick overview

Maintain a Notion catalog of active, inactive and archived n8n workflows. Each page contains an English README and one complete JSON attachment. The sync verifies saved content, preserves personal notes and reports incomplete backups as failures.

## How it works

- Start manually or hourly at minute 37. The imported template is inactive until you configure and publish it.
- Read workflow definitions through the n8n public API, following pagination and checking for overlapping executions.
- Match each workflow to one stable Notion page using its source ID.
- Generate **Quick overview**, **How it works**, **Setup**, **Customization** and **Additional info** as native headings and lists, with an overview below 50 words.
- Reuse suitable English sticky-note documentation. When notes are missing or unsuitable, describe the workflow graph in English without an AI service.
- Attach one complete, formatted `.json` file directly to its page. No JSON subpages, split code blocks, technical captions or visible checksums are created.
- Download the attachment and check its original bytes and workflow identity before accepting a replacement. Retain the previous copy if verification fails.
- Preserve personal notes and recognized edits to managed documentation. Mark missing sources **Unavailable** while keeping their last README and attachment.
- Process one definition at a time, pace Notion requests and use bounded retries. Unchanged definitions reuse recent checks; full verification occurs at least every 24 hours.
- Return an execution report that treats incomplete coverage as a failure.

## Setup

- Import `workflow.json` into an n8n instance with public API access. No community nodes or companion workflows are required.
- For self-hosted regular execution mode, configure filesystem-backed binary storage to keep large state and attachments out of execution JSON. Queue deployments must use a binary backend supported by their n8n configuration. Review execution pruning and storage capacity before enabling unattended runs.
- Create an n8n API credential with workflow-read and execution-read access, then select it in **n8n API · read only**. Its scope determines which workflows the catalog can discover.
- Create a dedicated Notion page and a database inside it. Share both with a Notion integration that can read, insert and update content and upload files. Select its credential in **Notion API · snapshots & audit** and **Upload complete JSON file**.
- Create the database properties shown below, with these exact English names and types. Keep **ID** for stable matching; you can hide it from the view. Create a **Current workflows** view filtering out `Status = Unavailable` if desired.
- In **Configuration**, replace `documentationDataSourceId` with the database's **data source ID**, `documentationRootPageId` with its parent page ID, `n8nOrigin` with your HTTPS instance URL and `n8nApiBase` with its HTTPS `/api/v1` URL. The data source ID can differ from the database ID; retrieve it from the Notion database API response. For a local self-hosted API in the same n8n container, `http://127.0.0.1:5678/api/v1` is also supported.
- To run without SMTP, keep both notification flags false and disable the optional **Send backup email** node before the first run. To use email notifications, select an SMTP credential, replace `emailTo` and `emailFrom`, then enable the desired notification flags. An optional independent error workflow can be selected in n8n settings; set `externalErrorHandler` accordingly to avoid duplicate error emails.
- Execute **Run manually** with no pinned data. Check an active and an inactive workflow page, confirm all five README sections and download/import-check their JSON attachments in an inactive copy.
- Review the default `Europe/Rome` time zone and **Hourly backup** schedule, then publish or activate the configured workflow.

| Property | Notion type | Purpose |
| --- | --- | --- |
| Name | Title | Workflow name |
| ID | Text | Stable source workflow identity |
| Status | Select | Active, Active · scheduled, Scheduled · inactive, Inactive, Archived, Unavailable |
| Trigger | Multi-select | Manual, Schedule, Webhook, Chat, Error, Sub-workflow, App trigger |
| Workflow link | URL | Link to the source in n8n |
| Updated at | Date | Source definition's modification timestamp |
| Notes | Text | Your personal notes, preserved by the sync |

## Customization

- Change the cron expression and time zone in **Hourly backup** and workflow settings.
- Adjust `includeArchived`, `includeWorkflowIds` and `excludeWorkflowIds` in **Configuration**. Inactive workflows are always included; workflows named `Temporary - …` are excluded as maintenance helpers.
- Improve English sticky notes in source workflows to provide more useful generated documentation. Workflow names and quoted node labels retain their original source spelling.
- Keep personal commentary in **Notes** or outside the five managed README sections. If a managed README section has been edited manually, the sync preserves the edit and reports it instead of silently overwriting it.
- Adjust the default 5 MiB `notionMaxFileBytes` only to match your Notion account's actual upload allowance. Single-part uploads are limited to 20 MiB by this implementation.
- Adjust the 45-minute run budget and request pacing to suit catalog size. Keep Notion requests at least 0.35 seconds apart; the default is one second.
- Keep the orange overview note and gray section notes around their existing nodes when extending the canvas.

## Additional info

- The package contains `workflow.json`, this `README.md`, `cover.png` and `thumbnail.png`. The workflow has no personal account links, database IDs, credential associations, pinned data, execution history or instance metadata. Configure the placeholders before running it.
- Notion stores readable documentation and the current saved workflow definition. It is not a Git repository or an n8n execution environment; the saved definition may differ from a published version.
- Source backups intentionally retain source node settings, identifiers, URLs and credential references so they remain useful for recovery. They are private operational backups, not anonymized templates for redistribution. Recognized secret literals are redacted, but arbitrary secrets embedded in custom code cannot be guaranteed to be detected.
- Encrypted credential values and pinned data are excluded. Back up the n8n database, encryption key, credentials and runtime files separately.
- Files over the configured upload limit fail explicitly and leave the previous backup intact. The workflow does not split exports or require Google Cloud Storage or another external file store.
- Successful production runs persist the verification cache. n8n manual executions do not persist workflow static data, so manual runs may repeat checks.
- This template uses native n8n nodes, the public n8n API and Notion API version `2026-03-11`, including the file-upload API. No AI API or paid documentation generator is required.
