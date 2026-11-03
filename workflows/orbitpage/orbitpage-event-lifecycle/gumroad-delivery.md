# OrbitPage Event Lifecycle
Thank you for downloading the OrbitPage Event Lifecycle workflow. This automation helps you publish approved event phases (before, during, and after) at one stable URL with guarded revisions, a durable journal, and a reusable local QR code.

## Download & Documentation
- Use the workflow JSON supplied with this product.
- [Read the setup guide](https://github.com/paoloronco/n8n-templates/tree/main/workflows/orbitpage/orbitpage-event-lifecycle#readme)
- [Project on GitHub](https://github.com/paoloronco/n8n-templates/tree/main/workflows/orbitpage/orbitpage-event-lifecycle)

## What's Included

- n8n workflow template
- Setup and configuration guide

## Getting Started
1. Import the workflow JSON into your n8n instance.
2. Run the included setup-journal.json workflow once to create six string columns and seed exactly one control row; running only Create table is insufficient.
3. Configure every Data Table node to select the dedicated event journal table.
4. Set OrbitPage API Token credentials on every OrbitPage node, using the Base URL https://orbitpage.com (without /api/v1).
5. Configure SMTP credentials on all email nodes and replace sender and owner email placeholders with your actual email addresses.
6. Understand that one writer per workspace is supported; exact revision/ETag and full draft/public verification protect unrelated content.
7. Note that mutations, AI, and SMTP have no automatic retry; a pending journal requires reconciliation before a supervised retry.
8. Test the workflow manually by submitting an event plan through the provided form trigger and approving it via email.

## Important Notes
- The workflow requires a dedicated event journal table with specific string columns and a single control row.
- Event plans must be approved by the owner email within 24 hours to store and publish phases.
- The workflow reconciles the current event phase every five minutes, including after downtime, updating a native subpage privately and publishing only its exact revision.
- Local SVG QR codes target the same stable event URL for easy sharing.
- Pausing or changing event versions requires a new approved plan.
- Logs for successful executions are not retained; failed logs are retained privately with operator pruning.

## Support & Updates
For support or inquiries, contact [info@paoloronco.it](mailto:info@paoloronco.it). Visit [https://paoloronco.it](https://paoloronco.it) and the GitHub repository at [https://github.com/paoloronco/n8n-templates](https://github.com/paoloronco/n8n-templates). Created by [Paolo Ronco](https://paoloronco.it).

## Complete Documentation

[Read the full setup and technical guide](https://github.com/paoloronco/n8n-templates/tree/main/workflows/orbitpage/orbitpage-event-lifecycle#readme)
