# Sync Google Sheets Menus and Price Lists to OrbitPage
Thank you for downloading this workflow template. This automation synchronizes menu items and price lists from a Google Sheet into a single native OrbitPage menu section, preserving other sections, items, and global settings on your page.

## Download & Documentation
- Use the workflow JSON supplied with this product.
- [Project on GitHub](https://orbitpage.com)

## What's Included

- n8n workflow template
- Setup and configuration guide

## Getting Started
1. Import the workflow JSON into your n8n instance (version 2.x or higher).
2. Configure Google Sheets credentials with a service account that has access to the source sheet.
3. Configure OrbitPage API credentials with the required permissions.
4. Set up SMTP credentials for sending approval emails if using the EMAIL_APPROVAL mode.
5. In the workflow, update the Configuration node with your Google Spreadsheet ID, sheet name, OrbitPage menu section name, and other required parameters.
6. Choose the synchronization mode: SAMPLE (test), PREVIEW (no writes), or EMAIL_APPROVAL (email diff and manual approval).
7. Ensure your OrbitPage native menu is enabled and configured with the correct currency.
8. Run the workflow manually or enable the schedule trigger to run every 30 minutes.
9. Review logs and email notifications to monitor synchronization status.

## Important Notes
- The workflow supports up to 250 source/menu items and 30 menu sections.
- Deletion of items requires ALLOW_DELETIONS to be true and approval through the workflow.
- The workflow preserves items missing or unapproved in the source sheet.
- The synchronization writes only to one native OrbitPage menu section; other sections and page content remain unchanged.
- Approval emails include exact before/after diffs and expire after a configurable timeout (default 48 hours).
- The workflow requires a compatible OrbitPage plan and the OrbitPage community node version 0.3.2 or higher.

## Support & Updates
For support or updates, contact [info@paoloronco.it](mailto:info@paoloronco.it) or visit [https://paoloronco.it](https://paoloronco.it). The project is maintained on [https://orbitpage.com](https://orbitpage.com).

Created by [Paolo Ronco](https://paoloronco.it).

## Complete Documentation

[Read the full setup and technical guide](https://app.notion.com/p/Sync-Google-Sheets-Menus-and-Price-Lists-to-OrbitPage-409f0ba27c3281adaf97c84b96825cf3)
