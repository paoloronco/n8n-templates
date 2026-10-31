# Telegram Multimodal to Notion Second Brain
Thank you for downloading this personal second-brain capture workflow. It helps you save diverse content from Telegram—such as Instagram Reels, public TikTok videos, webpages, screenshots, and free-form notes—into a structured Notion database with concise English titles, summaries, and actionable tasks.

## Download & Documentation
Use the workflow JSON supplied with this product, or [download the current v3 workflow](https://raw.githubusercontent.com/paoloronco/n8n-templates/main/workflows/secondbrain/v3/Telegram-Multimodal-to-Notion-Second-Brain_sanitized.json).

[GitHub version folder](https://github.com/paoloronco/n8n-templates/tree/main/workflows/secondbrain/v3) · [Complete setup guide](https://paoloronco.notion.site/Telegram-Multimodal-to-Notion-Second-Brain-40af0ba27c3281a79305de5bb8005998)

## What's Included

- n8n workflow template
- Setup and configuration guide

## Getting Started
1. Import the workflow JSON into your n8n instance.
2. Replace [REDACTED_TELEGRAM_USER_ID] in the Telegram Trigger node with your authorized Telegram user ID.
3. Replace [REDACTED_NOTION_DATABASE_ID] in node 17A with your Notion destination database ID.
4. Reconnect the Telegram, OpenAI text and Vision, Apify Header Auth, and Notion credentials.
5. Ensure your Telegram bot webhook is configured to use only this workflow to avoid conflicts.
6. Test by sending a supported content type (Instagram Reel link, TikTok video link, webpage URL, image, or rough note) to your Telegram bot.
7. Verify that entries are created in your Notion Inbox with English titles, summaries, tasks, and source details.
8. Review Telegram bot replies for confirmation or helpful error messages.

## Important Notes
- Only the first link per Telegram message is processed; additional links require separate messages.
- Images must be under 10 MB; unsupported attachments like videos or audio files are not processed.
- TikTok videos must be direct video links, not profile URLs.
- Public static webpages only; dynamic or login-protected pages may not be fully read.
- The workflow uses AI to generate English content regardless of the original language.

## Support & Updates
For support or questions, contact [info@paoloronco.it](mailto:info@paoloronco.it) or visit https://paoloronco.it. The general repository for n8n templates is at https://github.com/paoloronco/n8n-templates. Created by [Paolo Ronco](https://paoloronco.it).

## Complete Documentation

[Read the full setup and technical guide](https://paoloronco.notion.site/Telegram-Multimodal-to-Notion-Second-Brain-40af0ba27c3281a79305de5bb8005998)
