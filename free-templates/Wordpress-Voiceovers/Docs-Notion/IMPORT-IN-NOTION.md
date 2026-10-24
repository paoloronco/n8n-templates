# Notion publishing notes

The local Markdown files mirror the v1.3 implementation, but the maintained online documentation is the Notion page linked from the workflow.

If importing manually, create one documentation home and five child pages:

1. Overview & Quick Start
2. Google Cloud Setup
3. n8n Setup
4. Operations & Troubleshooting
5. Technical Reference & Customization

Merge the numbered local chapters into those five pages rather than creating twelve disconnected pages. Add real Notion page mentions from the home page so navigation survives publishing.

After every workflow or service change, update the local source, the five Notion pages, the home changelog and the catalog note in the same release. Do not claim that Cloud Run is IAM-protected when using portable API-key mode, and do not claim exactly-once queue processing because Google Sheets is not an atomic lock.
