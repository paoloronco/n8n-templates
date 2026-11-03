# OrbitPage Campaign Launch Kit
Thank you for downloading the OrbitPage Campaign Launch Kit. This workflow helps you submit a campaign brief, review and approve the campaign page and launch kit, publish the approved campaign subpage, verify the published content, and deliver the matching ad copy, UTM links, and QR code.

## Download & Documentation
- Use the workflow JSON supplied with this product.
- [Read the setup guide](https://github.com/paoloronco/n8n-templates/tree/main/workflows/orbitpage/orbitpage-campaign-launch-kit#readme)
- [Project on GitHub](https://github.com/paoloronco/n8n-templates/tree/main/workflows/orbitpage/orbitpage-campaign-launch-kit)

## What's Included

- n8n workflow template
- Setup and configuration guide

## Getting Started
1. Import the workflow JSON into your n8n instance.
2. Configure the OrbitPage API Token credentials with the Base URL set to https://orbitpage.com (without /api/v1).
3. Configure SMTP credentials on all email nodes and replace sender and owner email placeholders.
4. Run the included setup-journal.json workflow once to create six string columns and seed exactly one control row; running only Create table is insufficient.
5. Select the dedicated campaign journal table in every Data Table node.
6. Submit a campaign brief using the protected campaign_brief form, providing one offer, audience, CTA, and price/date facts.
7. Review the campaign page and ad draft sent by email and approve or reject within 24 hours or before the offer end time.
8. Upon approval, the workflow publishes the campaign subpage, verifies the published content, and delivers the launch package including ad copy, UTM links, and a local QR code.
9. Monitor the workflow execution logs for any errors and prune failed logs as needed.

## Important Notes
- The workflow requires a complete setup of the campaign journal table with one control row; partial setup will cause failures.
- Each OrbitPage node must use the OrbitPage API Token credentials with the correct Base URL.
- Email review expires at the earlier of 24 hours or the offer end time and is rechecked before any mutation.
- Ads remain drafts; this workflow does not integrate with Ads API or manage ad spend.
- The workflow uses deterministic templates without AI-generated content or images.
- Successful execution logs are not retained; failed logs are retained privately and require manual pruning.

## Support & Updates
For support or updates, contact [info@paoloronco.it](mailto:info@paoloronco.it) or visit https://paoloronco.it. The workflow repository is maintained at the linked GitHub project. Created by [Paolo Ronco](https://paoloronco.it).

## Complete Documentation

[Read the full setup and technical guide](https://github.com/paoloronco/n8n-templates/tree/main/workflows/orbitpage/orbitpage-campaign-launch-kit#readme)
