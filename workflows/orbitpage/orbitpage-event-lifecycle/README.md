# OrbitPage Event Lifecycle
## Quick overview
This workflow manages the lifecycle of an OrbitPage event by approving event plans, publishing event phases before, during, and after the event, and maintaining a durable journal and stable URL with QR code.
## How it works
1. The workflow starts with the `Review event plan` form trigger where the event owner submits a JSON event plan for approval.
2. The `Validate complete event plan` code node validates the submitted plan for correctness and completeness.
3. An email is sent via `Approve all three phases` node to request owner approval of the event phases.
4. If approved, the `Store approved plan` node updates the journal with the approved plan.
5. Every five minutes, the `Every five minutes` schedule trigger initiates a reconciliation process.
6. The workflow reads the active plan and journal state using `Read active plan and journal`.
7. It fetches the current workspace publication and subpages via `Read workspace and publication` and `Read current subpages`.
8. The `Read complete event draft` node retrieves the current draft workspace.
9. The `Calculate phase and detect drift` code node determines the current event phase (before, during, after) and detects any content drift.
10. If a transition is needed, the workflow either recovers an already published event or reserves a transition intent.
11. The `Build merged subpage collection` node constructs the updated subpage collection for the event phase.
12. The updated subpages are saved to a private draft using `Save exact revision to private draft`.
13. The draft is verified with `Verify resulting private draft`.
14. The workflow reads the event publication before publishing with `Read event publication before publish`.
15. The publication is bound to the approved phase in `Bind publication to approved phase`.
16. The prepared revision is persisted in the journal via `Persist prepared event revision`.
17. The draft is published using `Publish exact prepared revision`.
18. After a short wait, the public state is verified with `Verify public state`.
19. The published event revision is read using `Read published event revision`.
20. The verified phase is recorded in the journal via `Record verified phase` and `Store verified event journal`.
21. A stable QR code for the verified event URL is generated in `Verified event result and stable QR`.
## Setup
1. Initialize the journal using the instructions below.
2. In every `Data Table` node, select the dedicated event journal table.
3. Configure OrbitPage API Token credentials on all OrbitPage nodes, set Base URL to `https://orbitpage.com` without `/api/v1`.
4. Configure SMTP credentials on all email nodes and replace sender and owner email placeholders.
5. Ensure one writer per workspace with exact revision/ETag and draft/public verification enabled.
6. Use the `event_plan` JSON example below for the owner intake form.
7. Confirm token scopes include `workspace:read`, `publication:read`, `publication:write`, `pages:read`, and `pages:write`.
## Requirements
- n8n version 2.43.6 or later.
- n8n-nodes-orbitpage version 0.3.6.
- A dedicated event journal data table with six string columns and one control row.
- OrbitPage API token with appropriate scopes.
- SMTP credentials for sending approval emails.
- Properly formatted event plan JSON with before/during/after snapshots and ISO timestamps.
## Customization
- Replace email placeholders in the `Approve all three phases` node with actual sender and owner emails.
- Adjust the event plan JSON schema and validation logic in the `Validate complete event plan` code node if event structure changes.
- Modify the schedule interval in the `Every five minutes` trigger node if a different reconciliation frequency is desired.
- Customize the QR code generation logic in the `Verified event result and stable QR` code node if needed.
- Update the journal table selection in `Data Table` nodes to match your environment.

## Additional Details

This workflow requires an event journal table with six string columns and a single initialized control row, as described below. It uses exact revision and ETag checks to protect content integrity and requires manual approval of event plans via email within 24 hours. For implementation help or customization, contact info@paoloronco.it or visit https://paoloronco.it.

Full technical documentation: https://github.com/paoloronco/n8n-templates/tree/main/workflows/orbitpage/orbitpage-event-lifecycle#readme

## Download and import

Import [OrbitPage-Event-Lifecycle.json](./OrbitPage-Event-Lifecycle.json) into n8n. Configure OrbitPage and SMTP credentials, sender and owner email addresses, and the journal table before activation.

## Initialize the journal

Create a dedicated n8n Data Table for this workflow. Add six **String** columns and exactly one row with these values:

| Column | Initial value |
| --- | --- |
| `key` | `control` |
| `state` | `idle` |
| `context` | `event` |
| `execution_id` | `setup` |
| `snapshot` | `{"runs":{},"plan":null,"lastVerified":null}` |
| `updated_at` | Current UTC timestamp in ISO 8601 format |

Select this same table in every Data Table node. Keep a separate journal for each imported workflow instance. Initialize the control row only once; do not reset an existing journal or add duplicate control rows.

## Input example

Replace the example offer/event facts, dates and HTTPS destinations before submitting the form.

```json
{
  "id": "photo-workshop",
  "version": 1,
  "slug": "photo-workshop",
  "timezone": "Europe/Rome",
  "startAt": "2027-03-05T10:00:00+01:00",
  "endAt": "2027-03-05T18:00:00+01:00",
  "paused": false,
  "before": {
    "title": "Photography workshop",
    "description": "See the agenda and book your place.",
    "ctaLabel": "Book a place",
    "ctaUrl": "https://example.com/book"
  },
  "during": {
    "title": "The workshop is live",
    "description": "Access the event information.",
    "ctaLabel": "Join the workshop",
    "ctaUrl": "https://example.com/live"
  },
  "after": {
    "title": "Thank you for joining",
    "description": "Find the recording and follow-up resources.",
    "ctaLabel": "Watch the replay",
    "ctaUrl": "https://example.com/replay"
  }
}
```

## Third-party notices

The SVG QR Code nodes embed **qrcode-generator 2.0.4**, by Kazuhiko Arase, distributed under the MIT License. Original source: https://github.com/kazuhikoarase/qrcode-generator · https://www.npmjs.com/package/qrcode-generator

Copyright (c) 2009 Kazuhiko Arase

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
