# Template Publishing Assistant - v6
## Quick overview
This workflow assists in preparing and publishing n8n workflow templates by sanitizing secrets, generating documentation, creating visual assets, and packaging deliverables for distribution.
## How it works
1. Triggered by uploading an exported n8n workflow JSON file through the `Upload workflow` form trigger.
2. The `Email configuration` node sets sender and recipient email addresses for notifications.
3. The uploaded workflow JSON is scanned and sanitized by `Scan and redact workflow secrets` to remove sensitive information.
4. The sanitized workflow is analyzed in `Analyze uploaded JSON` to extract metadata and prepare for documentation.
5. The latest repository README is fetched by `Read GitHub repository README` for reference.
6. AI nodes generate unified documentation (`AI - Unified documentation`), Gumroad delivery page content (`AI - Gumroad delivery and metadata`), and visual prompts (`AI - Visual prompts`).
7. Visual prompts are used to generate thumbnail and cover images via OpenAI Image Generation nodes.
8. Generated images and documentation are merged and combined into a publishing package.
9. The workflow detects required external services and generates detailed Notion documentation with multiple pages.
10. Notion API nodes create and populate the documentation pages in the configured Notion workspace.
11. Sticky notes are generated or preserved and nodes are aligned to improve workflow readability.
12. A sanitized workflow JSON and all deliverables are packaged and an email with attachments is prepared and sent via SMTP.
## Setup
1. In the `Upload workflow` form trigger, configure the webhook path and define form fields for workflow JSON upload, product name, notes, URLs, and sticky note regeneration choice.
2. In the `Email configuration` node, set `mailFrom` and `mailTo` to valid email addresses for sending publishing notifications.
3. Provide valid credentials for OpenAI API, SMTP email, and Notion API nodes as required.
4. Configure the Notion API node with the target page ID where documentation will be created.
5. Ensure the workflow has access to the GitHub repository README URL or adjust the `Read GitHub repository README` node URL if needed.
6. Verify that the OpenAI API keys have permissions for chat completions and image generation.
7. Test the workflow by uploading a sanitized n8n workflow JSON file and selecting whether to regenerate sticky notes.
8. Review generated documentation, images, and email content before sending.
## Requirements
- n8n instance with internet access.
- Valid OpenAI API credentials with chat and image generation access.
- SMTP email credentials for sending emails.
- Notion API credentials with permission to create and edit pages.
- Uploaded workflow JSON file must be valid and under 1.5 MB.
- Access to the GitHub repository README URL or supply equivalent documentation.
## Customization
- Modify the `Upload workflow` form fields to add or remove metadata inputs.
- Adjust the sanitization patterns in `Scan and redact workflow secrets` to fit specific secret types.
- Change AI model parameters or prompts in the AI nodes to alter documentation style or content.
- Update Notion page ID in the Notion API node to target a different workspace or page.
- Customize email templates and attachment handling in `Prepare publishing email and attachments` and `Send publishing package via SMTP`.
- Enable or disable sticky note regeneration via the form input to preserve original notes or generate new ones.

## Additional Details

This workflow automates multiple stages of n8n template publishing but requires manual review of sanitized workflows and generated documentation before final use. Sticky notes regeneration depends on the uploaded workflow's node data integrity. For implementation help or customization, contact info@paoloronco.it or visit https://paoloronco.it.

Full technical documentation: https://app.notion.com/p/Template-Publishing-Assistant-v6-409f0ba27c3281ca947efce6f8e70ca4
