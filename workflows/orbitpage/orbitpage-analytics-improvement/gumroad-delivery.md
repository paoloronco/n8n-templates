# OrbitPage Analytics Improvement
Thank you for downloading this workflow. This automation helps you review weekly OrbitPage analytics and optionally approve one precise CTA title improvement using server AI previews.

## Download & Documentation
- Use the workflow JSON supplied with this product.
- [Read the setup guide](https://github.com/paoloronco/n8n-templates/tree/main/workflows/orbitpage/orbitpage-analytics-improvement#readme)
- [Project on GitHub](https://github.com/paoloronco/n8n-templates/tree/main/workflows/orbitpage/orbitpage-analytics-improvement)

## What's Included

- n8n workflow template
- Setup and configuration guide

## Getting Started
1. Import the workflow JSON into your n8n instance.
2. Configure OrbitPage API Token credentials on all OrbitPage nodes, setting Base URL to https://orbitpage.com (without /api/v1).
3. Configure SMTP credentials on all email nodes and replace sender and owner email placeholders.
4. Run the provided setup-journal.json workflow once to create six string columns and seed exactly one control row; running only the Create table node is insufficient.
5. Select the dedicated table in every Data Table node.
6. The workflow triggers every Monday at 09:00 Europe/Rome time to generate a seven-day analytics report with previous period comparison.
7. Review the report sent by email; if eligible, the first approval authorizes preparation of one CTA title preview.
8. Review the exact server preview in a second email and approve it within eight minutes and before the server preview expires. Only this second approval permits publication of the exact preview.
9. Monitor the workflow logs and journal for execution outcomes and next measurement scheduling.

## Important Notes
- The workflow requires a dedicated journal table with a single control row initialized by the setup.
- Mutations, AI, and SMTP nodes have no automatic retry; a pending journal requires manual reconciliation before retrying.
- The workflow validates unchanged URL, IDs, block order, profile, and theme to ensure no unrelated content changes.
- Low or missing analytics (under 100 visits), ambiguous CTA attribution, or unpublished changes result in report-only mode without AI edits.
- Successful execution logs are not retained; failed logs are retained privately with operator pruning.
- Existing VALIDATION.md documents acceptance scope; no guarantees of uplift or statistical significance are made.

## Support & Updates
For support or updates, contact [info@paoloronco.it](mailto:info@paoloronco.it) or visit https://paoloronco.it. The workflow repository is maintained at https://github.com/paoloronco/n8n-templates. Created by [Paolo Ronco](https://paoloronco.it/).

## Complete Documentation

[Read the full setup and technical guide](https://github.com/paoloronco/n8n-templates/tree/main/workflows/orbitpage/orbitpage-analytics-improvement#readme)
