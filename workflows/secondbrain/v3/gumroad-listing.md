# Telegram Multimodal to Notion Second Brain
## Quick overview
Capture and organize content from Telegram messages including Instagram Reels, TikTok videos, webpages, images, and free-form ideas into a structured Notion database with English summaries and tasks.
## How it works
1. Trigger on incoming Telegram messages from a specified authorized user.
2. Extract message text, URLs, attachments, and classify content type (Instagram, TikTok, website, image, idea, help, or error).
3. Route processing based on content type.
4. For Instagram Reels, extract and validate the Reel URL format.
5. For valid Instagram or TikTok links, start a transcript scraping run via Apify actors.
6. Poll Apify until transcript run completes or times out.
7. Retrieve and validate transcript or caption content for usability.
8. For webpages, fetch and extract main text content from the public URL.
9. For images, download the file and perform OCR and visual context extraction using OpenAI Vision.
10. For free-form ideas, preserve the original text as source.
11. Build an AI prompt combining source text, captions, and metadata to generate a concise English summary, tasks, and structured data.
12. Analyze content with OpenAI GPT-5.5 using a structured output parser.
13. Check AI output completeness and validity.
14. Prepare a Notion page payload with mapped properties and content blocks.
15. Create a new page in the specified Notion Inbox database.
16. Format a Telegram reply confirming success or reporting errors with helpful hints.
17. Send the reply back to the user in Telegram.
## Setup
1. Replace `[REDACTED_TELEGRAM_USER_ID]` in the `01 — Receive Content From Telegram` node with the authorized Telegram user ID.
2. Replace `[REDACTED_NOTION_DATABASE_ID]` in the `17A — Prepare Notion Knowledge Page` node with your Notion Inbox database ID.
3. Configure Telegram API credentials in the Telegram Trigger and Telegram nodes.
4. Configure OpenAI API credentials for the OpenAI Chat Model and OpenAI Vision nodes.
5. Configure Apify HTTP Header Authentication credentials for the transcript scraping API calls.
6. Configure Notion API credentials in the HTTP Request node creating pages.
7. Verify the Notion database schema includes properties named Title (title), Status (status with Unsorted option), Type (select), Category (select), Source (URL), and Date (date).
8. Ensure the Notion select options for Type include Instagram, TikTok, website, Screenshot, Idea.
9. Ensure the Notion select options for Category include AI, Cyber, Tech, Lifestyle.
## Requirements
- Telegram bot with webhook access and API credentials.
- Authorized Telegram user ID for message filtering.
- OpenAI API key with access to GPT-5.5 and Vision models.
- Apify account and API token for Instagram and TikTok transcript scraping actors.
- Notion integration with API token and access to the target database.
- Notion database configured with required property names and options.
- Publicly accessible URLs for Instagram Reels, TikTok videos, and webpages.
- Images under 10 MB for OCR processing.
## Customization
- Modify Notion property mappings and select options to match your database schema.
- Adjust AI prompt instructions in the `14 — Build AI Prompt` node to change summary style or content.
- Extend supported content types or add new source handlers by updating the routing logic.
- Change language or output length constraints in the AI prompt as needed.
- Adapt error handling messages in the reply formatting node.
- Configure timeouts and retry intervals for Apify transcript runs.
- Add or remove categories and tags in the AI output parser schema.

## Additional Details

This workflow processes only the first link per Telegram message and supports images under 10 MB. It requires replacing placeholder IDs with your own Telegram user ID and Notion database ID. For implementation help or customization, contact info@paoloronco.it or visit https://paoloronco.it.

Full technical documentation: https://paoloronco.notion.site/Telegram-Multimodal-to-Notion-Second-Brain-40af0ba27c3281a79305de5bb8005998

## Gumroad product details

| Detail | Information |
| --- | --- |
| Integrations | Telegram; Notion; OpenAI; Apify |
| Outputs and validation | Review the workflow execution and verify the expected destination data manually before publication. |
| Limitations and troubleshooting | Requires correct credentials and configuration; inspect n8n execution errors when a run fails. |
| What you receive | n8n workflow template; Setup and configuration guide |
| Additional Details | This workflow processes only the first link per Telegram message and supports images under 10 MB. It requires replacing placeholder IDs with your own Telegram user ID and Notion database ID. For implementation help or customization, contact info@paoloronco.it or visit https://paoloronco.it. Full documentation: https://paoloronco.notion.site/Telegram-Multimodal-to-Notion-Second-Brain-40af0ba27c3281a79305de5bb8005998 |
| Call to action | Use this workflow to capture and organize your Telegram content efficiently into Notion. |
| Tags | n8n; Telegram; Notion; Second Brain; AI; Automation; Instagram; TikTok; Webpage; Workflow |
