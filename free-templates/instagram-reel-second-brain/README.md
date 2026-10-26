# Instagram Reel to Notion Second Brain

## Quick Overview

Turn useful Instagram Reels into searchable Notion knowledge. Send a public Reel link to Telegram; Apify extracts the transcript and available captions, OpenAI summarizes and organizes the information, and n8n saves a structured entry in your Notion Inbox with a link to the original source.

## How It Works

- **Receive:** A Telegram bot accepts a public Instagram Reel or compatible video-post URL. `/start` and `/help` commands are handled without invoking paid APIs.
- **Validate:** The workflow extracts the first supported Instagram URL and rejects invalid or unsupported inputs before starting transcription.
- **Transcribe:** An Apify Actor retrieves spoken content, available captions, and creator metadata. The workflow checks execution status and validates its output.
- **Analyze:** OpenAI generates a concise structured summary in the selected workflow language, identifies relevant topics and technical references, and filters promotional calls to action.
- **Organize:** Extract key takeaways and, where available, tools, repositories, explicit links, practical steps, possible applications, follow-up actions, and uncertainties.
- **Save:** A native Notion node creates an Inbox page with title, category, source URL, date, status, and structured knowledge sections.
- **Confirm:** Telegram replies with a link to the newly created Notion page.

## Setup

- **Choose your language:** Import [the Italian workflow](./Instagram_Reel_to_Notion_Second_Brain.json) for Italian notes and replies, or [the English workflow](./Instagram_Reel_to_Notion_Second_Brain_EN.json) for English notes and replies. Import only the variant you intend to activate with a given Telegram bot.
- **Telegram:** Create a bot through [BotFather](https://t.me/BotFather), connect its n8n credentials, and replace the placeholder allowed Telegram user ID with your own.
- **Apify:** Create a Header Auth credential with header `Authorization` and value `Bearer YOUR_APIFY_TOKEN`. Apply it to every Apify HTTP Request node and confirm access to the configured Actor.
- **OpenAI:** Add your API credential to OpenAI Chat Model and select a supported model capable of producing the expected structured output.
- **Notion:** Create an integration, grant it access to your Inbox database, and configure the database in `17B — Notion Create Inbox Page`.
- **Database properties:** Configure `Titolo` (Title), `Stato` (Status), `Tipo` (Select), `Categoria` (Select), `Fonte` (URL), and `Data` (Date), or adapt the mappings to your own schema.
- **Default values:** The template expects `Stato` = `Da smistare`, `Tipo` = `Instagram`, and categories `AI`, `Cyber`, `Tech`, or `Lifestyle`. Ensure these options exist or change the mappings and parser.
- **Activate and test:** Re-select all imported credentials, ensure no competing active workflow uses the same Telegram bot webhook, send a public Reel URL, and verify the Telegram response and Notion page.
- **Detailed guide:** See the [complete setup documentation](https://paoloronco.notion.site/Documentation-Instagram-Reel-to-Notion-Second-Brain-404f0ba27c3281e1b7e0cd5159fb6bc7).

## Requirements

- **n8n:** Cloud or self-hosted instance with a publicly reachable HTTPS webhook for Telegram.
- **Telegram:** Bot token issued by BotFather and your Telegram user ID for access restriction.
- **Apify:** Account, API token, and access to the third-party [Instagram Video Transcript Scraper](https://apify.com/lance_api/instagram-video-transcript-scraper) Actor.
- **OpenAI:** API credentials and access to a compatible chat model.
- **Notion:** Integration credential with access to a destination Inbox database.
- **Database schema:** Compatible Notion property types and select/status options, or adjusted mappings.
- **Usage costs:** Apify and OpenAI can charge separately based on usage. Review their pricing and limits before activation.

## Customization

- **Instagram URL validation:** Change which Reel and compatible video-post URL formats are accepted.
- **Transcript extraction:** Adjust the Apify Actor, execution timeout, and maximum charge per run.
- **AI summarization:** Customize summary length, output language, captions, promotional filtering, and technical entity identification.
- **AI model:** Select another supported OpenAI model and configure its credentials.
- **Content categorization:** Update the structured output schema and allowed categories.
- **Notion page content:** Modify note sections, text limits, and extracted details.
- **Notion database:** Choose another database, rename properties, and adapt mappings and allowed values.
- **Telegram notifications:** Adjust confirmation wording and displayed information.
- **Node references:** Some Code nodes refer to other nodes by name. Update the corresponding expressions if renaming nodes.

## Additional Info

- **Supported sources:** Public Instagram Reels and compatible video posts only. YouTube, websites, GitHub URLs, and screenshots are not supported.
- **No visual analysis:** Information displayed only in video frames is not extracted.
- **Source reliability:** Technical claims, repository identities, URLs, and commands are not independently verified. Missing references are not invented.
- **Availability:** Private, inaccessible, unsupported, or speechless videos may fail validation or transcription.
- **Duplicate submissions:** Reprocessing a URL may create another Notion page and incur additional API usage.
- **Error handling:** Provider failures and unsuccessful Notion writes are not guaranteed to recover automatically. Review n8n execution history.
- **Telegram troubleshooting:** Check bot token, allowed user ID, HTTPS webhook, and competing active workflows.
- **Apify troubleshooting:** Check the `Authorization: Bearer ...` header, Actor identifier, execution status, and dataset output.
- **OpenAI and Notion troubleshooting:** Check model access, structured output schema, integration permissions, database ID, property types, and Expression mode.
- **Telegram formatting:** Check HTML parse mode and escaping of reserved characters if a reply fails.
- **Security:** Store secrets in n8n credentials and replace personal IDs, database IDs, and credential references before distributing the workflow.
- **Documentation:** [Full setup and troubleshooting guide](https://paoloronco.notion.site/Documentation-Instagram-Reel-to-Notion-Second-Brain-404f0ba27c3281e1b7e0cd5159fb6bc7).
- **Source code and creator:** [n8n templates repository](https://github.com/paoloronco/n8n-templates) and [n8n Creator profile](https://n8n.io/creators/paoloronco/).
- **Attribution:** Adapted from an existing n8n Creator template for creator-focused Reel analysis. Credit the original author and listing once verified.
- **Potential extensions:** Deduplication, video-frame analysis, external link verification, and additional content sources are not included in this release.
- **Implementation support:** Visit [paoloronco.it](https://paoloronco.it) or email [info@paoloronco.it](mailto:info@paoloronco.it).
