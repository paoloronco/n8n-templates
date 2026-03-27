# n8n Workflow Scheduling Extraction — Setup & Docs

> Workflow ID: `pStGJY9nBWvTz-cVsJXha` · instance: `n8n.prhomelab.com` · trigger: every 30 minutes · tag: `DEV`

---

## What it does

Every 30 minutes, reads all workflows from the n8n instance via REST API, extracts `scheduleTrigger` and `cron` nodes, compares the live state against a Google Sheets state store, and syncs Google Calendar with recurring events representing each workflow's schedule.

- A **new** scheduled workflow → creates a recurring event on Google Calendar
- A workflow with a **changed schedule** → deletes the old event and creates a new one
- A workflow with an **unchanged schedule** → no action (skip)

State (Calendar EventID, schedule string, On Calendar flag) is persisted in a Google Sheets tab.

---

## Data flow

```
Schedule Trigger (every 30 min)
  │
  ▼
Get many workflows ─── n8n REST API GET /api/v1/workflows
  │
  ▼
Code: parsing ─── extracts scheduleTrigger / cron nodes, normalises to human string
  │
  ▼
Code: save current values ─── snapshots live fields into current_* prefixed copies
  │
  ▼
Sheets: Lookup ─── reads saved state per WorkflowID (schedule, On Calendar, Calendar_EventID)
  │
  ▼
Code: manual merge ─── joins live data + Sheets rows on WorkflowID
  │
  ▼
Code: detect changes ─── assigns action: create / update / skip
  │
  ├─── create ──▶ Remove Duplicates ──▶ Code: RRULE ──▶ Create event (GCal)
  │                                                           │
  │                                                           ▼
  │                                                    Code: post-create
  │                                                           │
  │                                                           ▼
  │                                                    Sheets: OnCalendar=YES
  │
  └─── update ──▶ (same create path above)
              └──▶ Code: split eventIds ──▶ Delete old event (GCal)
```

---

## Prerequisites

| Resource | Purpose | Notes |
|---|---|---|
| n8n instance with API enabled | Read workflow list | Self-hosted or cloud |
| Google Cloud Project | Service Account + OAuth2 | Same GCP project for both |
| Google Sheets | State store | Sheet ID hardcoded in workflow |
| Google Calendar | Event destination | Account configured in credential |
| Error workflow | Error notifications | Set in workflow Settings |

---

## Setup

### 1 · n8n API Key

1. In n8n: **Settings → API → Generate API Key**
2. Copy the key
3. In n8n Credentials → create **n8n API** → paste the key and the instance URL
4. Rename the credential: `n8n account` (or any name — update the node reference accordingly)
5. In the **Get many workflows** node, select this credential

### 2 · Google Service Account (for Sheets)

The Service Account has no OAuth expiry — it is the stable solution for Sheets access.

1. **GCP Console → IAM & Admin → Service Accounts → Create**
2. Name: e.g. `n8n-workflows-sa`
3. **Keys → Add Key → JSON** → download the file
4. In n8n Credentials → **Google Service Account** → paste the JSON content
5. Rename: e.g. `Google Service Account`

#### Share the Google Sheets

1. Create a spreadsheet (or use an existing one)
2. **Share → Add the Service Account email** (e.g. `n8n-workflows-sa@project.iam.gserviceaccount.com`)
3. Role: **Editor**
4. Copy the spreadsheet ID from the URL (`https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`) and paste it into both **Sheets** nodes in the workflow
5. The tab must be named exactly **`n8n Scheduling`**

The tab will be created and populated automatically on the first run via `appendOrUpdate`. If you want to pre-create it, use these columns in order:

```
WorkflowID | Workflow | Tags | triggerType | schedule | freq | atHour | atMinute | byDay | byMonthDay | interval | On Calendar | Calendar_EventID | calendarLastSync
```

### 3 · Google Calendar OAuth2

> ⚠️ This credential **expires periodically** and requires manual reauthorization. When it expires, sections D (create event) and E (delete old event) will fail.

1. **GCP Console → APIs & Services → Credentials → Create OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorized redirect URI: `https://YOUR_N8N_INSTANCE/rest/oauth2-credential/callback`
2. Copy the client ID and client secret
3. In n8n Credentials → **Google Calendar OAuth2 API** → enter client ID and secret
4. Click **Connect** → browser opens → authorize with the correct Google account
5. Rename: e.g. `Google Calendar OAuth2`
6. In all three Google Calendar nodes, update the `calendar` field to point to your calendar (email or calendar ID)

#### When it expires — reauthorization

**Settings → Credentials → [your credential name] → Reconnect**

### 4 · Workflow Settings

In the workflow **Settings** tab:

- **Error Workflow**: set to a workflow that notifies you on failure (recommended — OAuth expiry is silent otherwise)
- **Caller Policy**: Workflows from same owner
- **Execution Order**: v1

---

## First run

1. In all Google Calendar nodes, set the `calendar` field to your Google Calendar ID (usually your email)
2. In both Google Sheets nodes, set the `documentId` to your spreadsheet ID and confirm the sheet tab is `n8n Scheduling`
3. Activate the workflow (toggle **Active**)
4. Run it manually the first time to verify everything works
5. Check Google Sheets: all rows should have `On Calendar = YES` and a populated `Calendar_EventID`
6. Check Google Calendar: events should appear as recurring, prefixed with `n8n | `

---

## Schedule type behaviour

| Type | Action | Notes |
|---|---|---|
| Daily (`Every day HH:MM`) | Creates DAILY event | Infinite recurrence |
| Weekly (`Every mon HH:MM`) | Creates WEEKLY event | Supports specific and multiple days |
| Monthly (`Every month (day N) HH:MM`) | Creates MONTHLY event | |
| Hourly (`Every hour :MM`) | 1 DAILY event at `00:MM` | Not 24 events — avoids GCal rate limit |
| Minutely / Cron | **SKIP** — no event created | Not supported by Google Calendar RRULE |
| This workflow itself | **SKIP** | Name filter: `Workflow Scheduling Extraction` |

---

## Troubleshooting

### Workflow fails on Google Calendar nodes (Create / Delete)

**Most likely cause**: expired OAuth2 credential.

1. Settings → Credentials → Google Calendar OAuth2 → **Reconnect**
2. Reactivate the workflow if it was deactivated due to the error
3. Run manually to verify

### Calendar events are not deleted after an update

Check that the `Calendar_EventID` column in Sheets is not empty for that workflow row. If it is empty, the delete branch has nothing to act on.

To force a full recreation:
1. Delete the stale Calendar event manually
2. Clear the `On Calendar` column in Sheets for that row (or delete the row entirely)
3. Re-run the workflow

### A workflow does not appear on Calendar

Possible causes:
- Schedule type is unsupported (cron, minutely) → expected behaviour
- Workflow was excluded by the name filter → check `SKIP_WORKFLOW_NAME_CONTAINS` in the **Code: RRULE** node
- Sheets credential lost permissions → verify the sheet is still shared with the Service Account email

### Sheets is not updating

Verify that the Service Account credential is still valid and that the Service Account has the **Editor** role on the sheet. Service Account JSON keys do not expire but can be revoked from GCP Console.

### Webhook sub-flow (section F) does not work

The webhook node is **intentionally disconnected** — it is a manual maintenance utility for bulk-deleting Calendar events. To use it:
1. Temporarily connect it
2. Trigger via HTTP POST with the event IDs in the request body
3. Remove the connections after use

---

## Google Sheets structure

Tab: `n8n Scheduling`

| Column | Description |
|---|---|
| `WorkflowID` | Unique n8n workflow ID — match key for all operations |
| `Workflow` | Workflow name |
| `Tags` | Workflow tags (JSON array string) |
| `triggerType` | `scheduleTrigger` or `cron` |
| `schedule` | Human-readable schedule string (e.g. `Every day 09:30`) |
| `freq` | `daily` · `weekly` · `monthly` · `hourly` · `cron` · `minutely` |
| `atHour` / `atMinute` | Trigger hour and minute |
| `byDay` | Days for weekly schedule (e.g. `MO,WE,FR`) |
| `byMonthDay` | Day of month for monthly schedule |
| `interval` | Recurrence interval (default 1) |
| `On Calendar` | `YES` if event exists on Calendar, empty / `NO` if not yet created |
| `Calendar_EventID` | Google Calendar event ID — space-separated if multiple |
| `calendarLastSync` | Last sync date (ISO format) |

---

## Workflow sections

| Section | Nodes | Description |
|---|---|---|
| A · Fetch | Schedule Trigger → Get many workflows | Fires every 30 min, fetches all n8n workflows via REST API |
| B · Parse & Lookup | Code: parsing → Code: save current values → Sheets: Lookup | Extracts and normalises schedule triggers, reads Sheets state |
| C · Change Detection | Code: manual merge → Code: detect changes → Switch | Joins live + saved data, assigns create/update/skip action |
| D · Create / Update | Remove Duplicates → Code: RRULE → Create event → Code: post-create → Sheets: OnCalendar=YES | Builds RRULE payload, creates GCal event, writes EventID back to Sheets |
| E · Delete Old Event | Code: split eventIds → Delete old event | Parallel to D on update — removes the previous Calendar event |
| F · Webhook (disconnected) | Webhook → Get many events2 → Delete an event | Manual maintenance sub-flow for bulk Calendar cleanup |
