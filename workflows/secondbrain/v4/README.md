# Build an AI Second Brain with Telegram, OpenAI & Notion

## Quick overview

Turn Telegram messages into an organized Notion knowledge inbox. Capture Instagram posts and Reels, TikTok videos, YouTube videos and Shorts, webpages, screenshots, or quick ideas. OpenAI extracts key information, creates concise English summaries, and suggests relevant next steps while preserving source context.

## How it works

1. **Capture:** A Telegram bot receives messages from an authorized user and identifies the source type.
2. **Extract:** Dedicated branches retrieve Instagram carousel images or video transcripts, TikTok transcripts, YouTube captions or speech-to-text, public webpage text, and screenshot content. Plain-text ideas are preserved directly.
3. **Analyze:** OpenAI produces a searchable title, short summary, key takeaways, optional details, and up to three evidence-based tasks in a structured format.
4. **Organize:** The workflow creates a Notion Inbox page with category, source information, original message, and relevant content blocks.
5. **Confirm:** Telegram returns a link to the saved page. Unsupported inputs and processing failures receive a helpful reply instead.

## Setup

1. **Import** the workflow JSON into n8n.
2. **Telegram:** Connect your bot credentials to the trigger and reply nodes. Replace `REPLACE_WITH_TELEGRAM_USER_ID` in `Telegram — Receive Message` with your numeric authorized user ID.
3. **OpenAI:** Connect an API credential to the chat model and Vision nodes; confirm the configured model is available to your account.
4. **Apify:** Configure HTTP Header Auth for the Instagram, TikTok, and YouTube actors used by the workflow.
5. **Notion:** Create or select an Inbox database, grant integration access, and replace `REPLACE_WITH_NOTION_DATABASE_ID` and the `*_PROPERTY_ID` placeholders in `Notion — Prepare Inbox Page`. Set the status option (`Unsorted` by default) to one available in your database.
6. **Check the schema:** The database must have title, status, type, category, source URL, and date properties. Create matching select/status options; categories are `AI`, `Cyber`, `Tech`, and `Lifestyle`, and source types include `Instagram`, `TikTok`, `YouTube`, `website`, `Screenshot`, and `Idea`.
7. **Reconfigure credentials:** The public JSON intentionally omits original credential references and n8n instance identifiers. Select your credentials in each related node.
8. **Test and activate:** Verify one message per supported source, an invalid link, and a failed extraction. Make sure no other active workflow is using the same Telegram bot webhook.

## Requirements

- **n8n** instance capable of receiving Telegram webhooks.
- **Telegram** bot token and authorized user ID.
- **OpenAI** API access for structured text analysis and image understanding.
- **Apify** account, API token, and access to the configured scraping/transcription actors.
- **Notion** integration with permission to create pages in the destination database.
- Publicly accessible source content for external extraction; usage-based API charges may apply.

## Customization

- **AI instructions:** Edit `AI — Build Prompt` to change language, summary length, categories, takeaways, and task-generation rules.
- **Output schema:** Update `Structured Output Parser` and the corresponding Notion page preparation logic together.
- **Notion layout:** Adjust properties, headings, content blocks, and task formatting in `Notion — Prepare Inbox Page`.
- **Sources:** Extend `Telegram — Classify Message` and `Telegram — Route by Type` with additional processing branches.
- **Feedback:** Customize help, success, and error messages in `Reply — Format Message`.
- **Limits:** Review Apify run limits, transcript handling, image constraints, and extraction timeouts before changing them.

## Additional information

- **One message, one entry:** Only the first URL is processed; Telegram albums are handled as separate messages.
- **English output:** Generated Notion content is in English, regardless of the source language. Original source information is retained where available.
- **Instagram:** Public Reels, photo posts, and carousels are supported; carousel analysis uses up to 20 ordered images or previews.
- **YouTube:** Videos and Shorts use available captions or AI speech-to-text. Very long transcripts may be sampled across the video.
- **TikTok:** Public video transcription supports up to 300 seconds of audio.
- **Images:** Telegram image attachments must be under 10 MB; unreadable text is not guessed.
- **Extraction limits:** Video visuals are not analyzed. Dynamic, private, login-protected, or unavailable pages may not yield usable text.
- **Tasks:** Suggested next steps are labeled as suggestions, not commitments. No persistent deduplication is implemented.
- **Reliability:** The bot confirms a successful save only after Notion returns a page ID. External services can fail or incur charges.

**Full technical documentation:** [Notion — Telegram Second Brain](https://app.notion.com/p/Telegram-Multimodal-to-Notion-Second-Brain-40af0ba27c3281a79305de5bb8005998)

**Support and customization:** [paoloronco.it](https://paoloronco.it) · [info@paoloronco.it](mailto:info@paoloronco.it)
**Version:** V4. This importable workflow has been sanitized: personal user IDs, Notion identifiers, credential references, webhook IDs, and instance-specific metadata have been removed or replaced with placeholders.
