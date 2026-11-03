# Review OrbitPage Analytics and Approve One CTA Improvement
## Quick overview
This workflow reviews weekly OrbitPage analytics, sends a measured report, and optionally prepares, reviews, and publishes one exact server AI preview of a CTA title improvement after email approvals.
## How it works
1. Triggered every Monday at 09:00 Europe/Rome by the `Weekly analytics review` schedule trigger.
2. Reads the current publication data using the `Read current publication` OrbitPage node.
3. Retrieves the last seven days of analytics with the `Read seven-day analytics` node.
4. Reads the current page draft from the workspace via `Read current page draft`.
5. Validates the evidence and plan using the `Validate evidence and plan` code node.
6. Checks if there is sufficient evidence for one hypothesis with the `Sufficient evidence for one hypothesis` IF node.
7. Reads the analytics report journal from the data table.
8. Prepares a measured report in the `Prepare measured report` code node.
9. Checks if an AI change has already been applied with `Recover already applied AI change` IF node.
10. If no recovery, selects analytics verification context and records report identity.
11. Determines if the report can propose an edit with the `Report can propose an edit` IF node.
12. If no edit is proposed, sends the report without an edit and records a report-only outcome.
13. If an edit is proposed, sends the report and asks to prepare an edit.
14. Waits for reviewer approval to prepare the edit with `Reviewer requests edit preparation` IF node.
15. Reads fresh page draft and AI allowance.
16. Reads fresh analytics publication and draft.
17. Prepares a concise edit instruction.
18. Creates a fresh AI preview of the proposed changes.
19. Validates the exact server AI preview.
20. Sends the exact AI proposal for review and approval via email.
21. Checks if the exact preview is approved and unexpired.
22. If approved, records the approved AI intent and persists it in the journal.
23. Applies the exact approved preview to the publication.
24. Waits briefly for AI edge publication to propagate.
25. Verifies the published revision matches expectations.
26. Reads the public AI result and verified analytics draft.
27. Verifies the exact published AI result.
28. Records the outcome and schedules the next measurement.
## Setup
1. Initialize the journal using the instructions below; creating the table without its control row is insufficient.
2. In every Data Table node, select the dedicated table created in setup.
3. In every OrbitPage node, select OrbitPage API Token credentials and set Base URL to `https://orbitpage.com` without `/api/v1`.
4. In all email nodes, select SMTP credentials and replace sender and owner email placeholders.
5. Configure the `Weekly analytics review` schedule trigger to run every Monday at 09:00 Europe/Rome.
6. Ensure one writer per workspace is configured with exact revision/ETag and full draft/public verification enabled.
7. Verify email approval labels and limits are set as required for double approval flows.
## Requirements
- OrbitPage API Token credentials with scopes: workspace:read, publication:read, publication:write, analytics:read, ai:write.
- SMTP credentials for sending approval and report emails.
- A dedicated data table with six string columns and one control row seeded by the setup workflow.
- n8n version 2.43.6 or later.
- n8n-nodes-orbitpage version 0.3.6 or later.
## Customization
- Replace all sender and owner email placeholders in email nodes with actual email addresses.
- Adjust the schedule trigger time or timezone if needed.
- Modify email subject lines and message templates in email nodes as required.
- Customize validation logic in code nodes if business rules change.
- Update the maximum wait times for approvals in email nodes if different timing is desired.
- Change the Base URL in OrbitPage nodes if using a different environment or API endpoint.

## Additional Details

This workflow requires a data table initialized with six string columns and a single control row, as described below. It strictly validates workspace content consistency and requires manual reconciliation if a journal is pending. The workflow sends weekly analytics reports and supports a double email approval process for one exact AI-generated CTA title improvement. For implementation help or customization, contact info@paoloronco.it or visit https://paoloronco.it.

Full technical documentation: https://github.com/paoloronco/n8n-templates/tree/main/workflows/orbitpage/orbitpage-analytics-improvement#readme

## Download and import

Import [OrbitPage-Analytics-Improvement.json](./OrbitPage-Analytics-Improvement.json) into n8n. Configure OrbitPage and SMTP credentials, sender and owner email addresses, and the journal table before activation.

## Initialize the journal

Create a dedicated n8n Data Table for this workflow. Add six **String** columns and exactly one row with these values:

| Column | Initial value |
| --- | --- |
| `key` | `control` |
| `state` | `idle` |
| `context` | `growth` |
| `execution_id` | `setup` |
| `snapshot` | `{"runs":{},"plan":null,"lastVerified":null}` |
| `updated_at` | Current UTC timestamp in ISO 8601 format |

Select this same table in every Data Table node. Keep a separate journal for each imported workflow instance. Initialize the control row only once; do not reset an existing journal or add duplicate control rows.
