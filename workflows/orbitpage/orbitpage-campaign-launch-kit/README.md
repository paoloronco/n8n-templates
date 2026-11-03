# OrbitPage Campaign Launch Kit
## Quick overview
This workflow builds an OrbitPage campaign subpage from a submitted campaign brief, generates ad copy with UTM links and a local QR code, manages email approval, publishes the approved campaign page, verifies the publication, and delivers the launch package.
## How it works
1. Triggered by a form submission with a JSON campaign brief containing offer, audience, CTA, price, and date facts.
2. Validate the submitted campaign brief JSON structure and field values using a Code node.
3. Read the campaign journal data table to retrieve the control row state.
4. Read the complete campaign draft and publication baseline from OrbitPage API.
5. Read the current subpage collection for the campaign from OrbitPage.
6. Build ad copy text blocks and append UTM tracking links based on the campaign brief.
7. Check if the campaign is already published to handle recovery scenarios.
8. Generate a local QR code asset representing the campaign URL.
9. Prepare a full review package including the campaign page, ad copy, UTM links, and QR code.
10. Reserve delivery intent by updating the campaign journal control row.
11. Send an approval email to the campaign owner with the review package, with Approve and Decline options, expiring at the earlier of 24 hours or the offer end time.
12. Wait for email approval and check if the approval is still valid before proceeding.
13. On approval, read the current publication revision again to ensure no workspace changes.
14. Read the fresh campaign draft and guard the approved payload and ownership.
15. Mark the campaign mutation as pending in the journal.
16. Save the reviewed subpages privately to OrbitPage without publishing.
17. Read back the private draft result to confirm changes.
18. Read the campaign publication before publishing to get the latest revision.
19. Bind the exact publication revision for concurrency control.
20. Persist the prepared campaign revision in the journal.
21. Confirm persistence and publish the approved campaign page.
22. Wait briefly for the campaign page to propagate through the CDN edge.
23. Select the verified campaign context and verify the page CTA and campaign facts by fetching the public URL.
24. Read the published campaign revision and record the verified campaign in the journal.
25. Store the verified campaign journal state.
26. Prepare verified launch attachments including the QR code and launch kit.
27. Deliver the launch package email to the campaign owner with attachments.
28. Mark the launch package as delivered in the journal.
29. Store the campaign delivery outcome in the journal.
30. If the campaign review is rejected or expired, release the rejected campaign review and update the journal accordingly.
## Setup
1. Initialize the journal using the instructions below; creating the table without its control row is insufficient.
2. In every Data Table node, select the dedicated campaign journal table.
3. In every OrbitPage node, select OrbitPage API Token credentials, set Base URL to `https://orbitpage.com` without `/api/v1`.
4. In all email nodes, select SMTP credentials and replace sender and owner email placeholders.
5. Configure the protected campaign_brief form to accept the closed-schema JSON example below with one offer, audience, CTA, price, and date facts.
6. Ensure one writer per workspace with exact revision/ETag and full draft/public verification to protect unrelated content.
## Requirements
- OrbitPage API Token credentials with scopes: workspace:read, publication:read, publication:write, pages:read, pages:write.
- SMTP credentials for sending approval and launch emails.
- A dedicated campaign journal data table initialized with one control row.
- The journal schema and its single control row initialized as described below.
- Campaign briefs submitted as JSON matching the closed schema.
- n8n version 2.43.6 and n8n-nodes-orbitpage version 0.3.6.
## Customization
- Replace sender and owner email placeholders in email nodes.
- Adjust email subject lines and message templates in the emailSend nodes.
- Modify the campaign brief form fields or validation logic in the Code nodes if campaign data structure changes.
- Update UTM parameters or QR code generation parameters in the respective Code nodes.
- Customize the timing for approval expiration or wait durations in the Wait and If nodes.
- Adapt the campaign journal table ID and column mappings if using a different data table.
- Extend or modify the review package content in the Prepare full review package Code node.
- Adjust the number of allowed subpages or slug restrictions in the validation code if needed.

## Additional Details

This workflow requires a dedicated campaign journal table initialized with exactly one control row and proper selection in all Data Table nodes. Email review approvals expire after 24 hours or at the offer end time, whichever is earlier, and must be verified before proceeding. The workflow does not handle Ads API integration or ad spend management. For implementation help or customization, contact info@paoloronco.it or visit https://paoloronco.it.

Full technical documentation: https://github.com/paoloronco/n8n-templates/tree/main/workflows/orbitpage/orbitpage-campaign-launch-kit#readme

## Download and import

Import [OrbitPage-Campaign-Launch-Kit.json](./OrbitPage-Campaign-Launch-Kit.json) into n8n. Configure OrbitPage and SMTP credentials, sender and owner email addresses, and the journal table before activation.

## Initialize the journal

Create a dedicated n8n Data Table for this workflow. Add six **String** columns and exactly one row with these values:

| Column | Initial value |
| --- | --- |
| `key` | `control` |
| `state` | `idle` |
| `context` | `campaign` |
| `execution_id` | `setup` |
| `snapshot` | `{"runs":{},"plan":null,"lastVerified":null}` |
| `updated_at` | Current UTC timestamp in ISO 8601 format |

Select this same table in every Data Table node. Keep a separate journal for each imported workflow instance. Initialize the control row only once; do not reset an existing journal or add duplicate control rows.

## Input example

Replace the example offer/event facts, dates and HTTPS destinations before submitting the form.

```json
{
  "id": "spring-workshop",
  "version": 1,
  "slug": "spring-workshop",
  "title": "Spring photography workshop",
  "audience": "Beginner photographers",
  "offer": "A one-day practical photography workshop.",
  "priceMinor": 4900,
  "currency": "EUR",
  "endsAt": "2027-03-01T18:00:00+01:00",
  "termsUrl": "https://example.com/terms",
  "ctaLabel": "Book a place",
  "ctaUrl": "https://example.com/book"
}
```

## Third-party notices

The SVG QR Code nodes embed **qrcode-generator 2.0.4**, by Kazuhiko Arase, distributed under the MIT License. Original source: https://github.com/kazuhikoarase/qrcode-generator · https://www.npmjs.com/package/qrcode-generator

Copyright (c) 2009 Kazuhiko Arase

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
