# Sync n8n Workflow Schedules to Google Calendar

## Quick Overview

Scan n8n workflows, extract supported Schedule Trigger configurations, compare them with persisted Google Sheets state, and automatically create or update recurring Google Calendar events when workflow schedules change.

## How It Works

- **Scheduled scan** — The workflow runs every 30 minutes and retrieves workflows from the n8n REST API.
- **Schedule parsing** — JavaScript identifies supported scheduled workflows and normalizes trigger settings into structured fields and human-readable schedule strings.
- **State lookup** — Google Sheets stores each workflow's previous schedule, Calendar status, event IDs, and last synchronization information.
- **Change detection** — Current n8n schedules are compared with saved state and classified as `create`, `update`, or `skip`.
- **Calendar creation** — Supported schedules are converted into recurrence settings and created as recurring Google Calendar events.
- **Schedule updates** — When a schedule changes, the workflow creates the replacement Calendar event and deletes previously stored event IDs.
- **State persistence** — Created event IDs and synchronized schedule data are written back to Google Sheets for subsequent comparisons.
- **Manual cleanup** — A separate disconnected webhook sub-flow can retrieve and delete Calendar events for maintenance.

## Setup

- **Import the workflow** — Import `workflow/n8n_Schedules-Google_Calendar_Sync.json` into n8n.
- **Configure the n8n API** — Create an n8n API key and connect the credential used to retrieve workflows from your instance.
- **Prepare Google Sheets** — Create the scheduling state sheet with the fields expected by the lookup and append/update nodes, then share it with your service account.
- **Configure Google Sheets credentials** — Import or connect the Google service account used by the Sheets nodes and select your spreadsheet and scheduling tab.
- **Connect Google Calendar** — Configure Google Calendar OAuth2 credentials and select the calendar where recurring workflow events should be created.
- **Replace placeholders** — Update spreadsheet IDs, calendar IDs, credentials, and any environment-specific workflow values in the imported template.
- **Test and activate** — Run manually, inspect create/update/skip decisions and Calendar events, then activate the 30-minute synchronization.

## Requirements

- n8n instance with REST API access
- n8n API key/credential
- Google Sheets spreadsheet used as synchronization state
- Google service account or compatible Sheets credentials
- Google Calendar and OAuth2 credentials
- Permission to create and delete events in the selected calendar

### Optional

- Public webhook access for the disconnected manual Calendar-cleanup flow
- Dedicated Google Calendar for n8n schedules
- Additional filtering rules for workflow names, tags, or environments
- Error workflow for synchronization failures

## Customization

- **Sync frequency** — Change the 30-minute Schedule Trigger interval.
- **Workflow filtering** — Adjust parsing logic to include or exclude workflows by name, tag, trigger type, or other metadata.
- **Schedule support** — Extend the parser and recurrence logic for additional n8n scheduling patterns.
- **Calendar representation** — Customize event names, descriptions, duration, recurrence behavior, and destination calendar.
- **State storage** — Adapt the Google Sheets schema or replace it with another persistent state mechanism.
- **Change handling** — Modify create, update, skip, or deletion behavior to match your preferred synchronization model.

## Additional Info

- Supported recurrence logic includes daily, weekly, monthly, and hourly schedules handled by the workflow's parser and Calendar conversion logic.
- Cron, minutely, and other unsupported schedule types are skipped by the current implementation.
- Hourly schedules are represented as one recurring daily Calendar event at the configured minute rather than 24 separate events.
- Google Sheets acts as the synchronization state store, including `WorkflowID`, schedule data, `On Calendar`, and `Calendar_EventID`.
- The manual webhook cleanup flow is separate from the main 30-minute synchronization pipeline.
- [Full documentation](https://paoloronco.notion.site/n8n-Workflow-Scheduling-Extraction-Setup-Docs-330f0ba27c3280ef99b2c5e8e7dfd497)
