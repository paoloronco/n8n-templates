# n8n → Notion | Workflow Backup & Sync
## Quick overview
This workflow synchronizes n8n workflows with their corresponding Notion database pages, backing up workflow JSON data as markdown in Notion subpages titled "Workflow".
## How it works
1. Triggered every hour by schedule (manual execution is also possible from the n8n editor).
2. Reads recent sync executions of this workflow to prevent overlapping runs.
3. Retrieves n8n workflows and matches non-archived workflows against the Notion catalog.
4. Reads a Notion database catalog containing pages linked to n8n workflows.
5. Searches Notion for existing "Workflow" subpages under catalog pages.
6. Plans synchronization by matching workflows to catalog pages and their subpages.
7. Processes each workflow one at a time.
8. Checks if a "Workflow" subpage exists; if yes, reads its JSON markdown content.
9. Compares the stored JSON with the current workflow snapshot.
10. If JSON differs, updates the Notion subpage with new workflow JSON markdown.
11. If no subpage exists, creates a new "Workflow" subpage with current workflow JSON markdown.
12. Reads back and verifies the updated or created JSON content for consistency.
13. Generates a sync report summarizing created, updated, unchanged, skipped workflows and errors.
## Setup
1. Configure the `Every hour1` node with a cron expression for periodic syncs (default is minute 17 each hour).
2. Set up n8n API credentials for nodes `Read sync executions1` and `Read n8n workflows1`.
3. Set up Notion API credentials for all Notion nodes including `Read catalog1`, `Find Workflow subpages1`, `Read workflow JSON1`, `Update workflow JSON1`, `Create Workflow page1`, `Read back JSON1`, and `Read created JSON1`.
4. In the `Read catalog` node, set `dataSourceId` to your Notion database ID containing workflow catalog pages.
5. Verify the catalog pages have a property named "Apri n8n" containing URLs linking to n8n workflows.
6. Confirm the workflow IDs in Notion links match active workflows in your n8n instance.
7. In the `Plan sync1` and `Sync report1` code nodes, replace `YOUR_NOTION_DATA_SOURCE_ID` with the catalog's actual Notion data source ID and `n8n\\.example\\.com` with your instance domain (keep the regex escaping).\n8. Test using **Execute workflow** in n8n before enabling the schedule.
## Requirements
- n8n instance with API access enabled.
- Notion account with API integration and access to the target database.
- Notion database with pages linking to n8n workflows via URLs.
- Properly configured n8n and Notion API credentials.
- Catalog pages must have a property named "Apri n8n" with valid n8n workflow URLs.
## Customization
- Adjust the `Every hour` node cron expression to change sync frequency.
- Modify the Notion database ID in the `Read catalog` node to target a different catalog.
- Adapt the search term in `Find Workflow subpages` node if subpage titles differ.
- Extend or modify the JavaScript code in `Plan sync1` or `Compare JSON1` nodes for custom sync logic.
- Change the naming or content format of the Notion subpages by editing the markdown generation code.

## Additional Details

This workflow synchronizes your active n8n workflows into a Notion database as JSON markdown snapshots, updating existing pages or creating new ones as needed. It requires your Notion database to have pages linked to workflows via URLs and enforces a single sync execution at a time to avoid conflicts. For implementation help or customization, contact info@paoloronco.it or visit https://paoloronco.it.

Full technical documentation: https://app.notion.com/p/n8n-Backup-Notion-DB-Sync-41af0ba27c32814d800cc4582aa68c04
## Public template notes
- The exported workflow has credential bindings and instance identifiers removed. Reassign n8n and Notion credentials after import.
- Sync is one-way (n8n to Notion), not historical versioning or a full disaster-recovery backup.
- The catalog property `Apri n8n` and the Notion subpage title `Workflow` are required unless the code is customized.
- This export contains an hourly schedule trigger; run it manually through the n8n editor during setup.
