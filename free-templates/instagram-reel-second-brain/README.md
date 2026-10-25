# Instagram Reel to Notion Second Brain

Turn Instagram Reels into concise, searchable knowledge in Notion. Send a link to Telegram; Apify retrieves the transcript and available author caption, OpenAI extracts the useful information, and n8n creates a structured Notion Inbox entry.

## Quick overview

Save useful ideas from Instagram Reels without manually transcribing or categorizing them. This workflow combines Telegram, Apify, OpenAI and Notion to extract spoken content and available captions, filter promotional noise, and create structured notes with source links and relevant technical references.

## How it works

1. **Receive:** A Telegram bot receives a public Instagram Reel or compatible video-post URL. `/start` and `/help` are handled without calling paid APIs.
2. **Validate:** The workflow extracts the first supported URL and rejects unsupported inputs before invoking Apify.
3. **Extract:** An Apify Actor transcribes spoken audio and returns available caption and creator metadata. n8n checks the run and validates the transcript.
4. **Analyze:** OpenAI produces a compact Italian summary and structured knowledge fields, using caption text to improve spelling of technical terms when available. Social engagement prompts such as “comment SETUP” are ignored.
5. **Save:** The native Notion node creates a page in an Inbox database with title, category, source, date, status and concise knowledge sections.
6. **Confirm:** Telegram sends a confirmation containing the Notion page link.

## Requirements

- n8n (Cloud or self-hosted) with a publicly reachable HTTPS webhook for Telegram
- Telegram bot token from [BotFather](https://t.me/BotFather)
- Apify account and API token, with access to the third-party [Instagram Video Transcript Scraper](https://apify.com/lance_api/instagram-video-transcript-scraper) Actor
- OpenAI API credentials and access to the configured chat model
- Notion integration credential with access to a destination database
- A Notion database with the expected properties, or an equivalent mapping

Apify and OpenAI may incur separate usage charges. Check current pricing and API availability before activation.

## Setup

1. Import the workflow JSON into n8n.
2. Create a Telegram bot, configure its n8n credential, and replace `REPLACE_WITH_YOUR_TELEGRAM_USER_ID` with your own numeric Telegram user ID.
3. Create an Apify **Header Auth** credential: `Authorization` = `Bearer YOUR_APIFY_TOKEN`. Apply it to all Apify HTTP Request nodes.
4. Select your OpenAI credential and an available compatible model in **OpenAI Chat Model**.
5. Create a Notion integration, grant it access to your Inbox database, and select it in **17B — Notion Create Inbox Page**.
6. Replace `REPLACE_WITH_YOUR_NOTION_DATABASE_ID` with your own Notion database ID and confirm the property mapping below.
7. Re-select all imported credentials (the public JSON contains none). Ensure no other active workflow is competing for the same Telegram bot webhook. Activate and test with a public Reel.

### Notion database properties

| Property | Type | Expected value |
| --- | --- | --- |
| `Titolo` | Title | AI-generated descriptive title |
| `Stato` | Status | `Da smistare` |
| `Tipo` | Select | `Instagram` |
| `Categoria` | Select | One of `AI`, `Cyber`, `Tech`, `Lifestyle` |
| `Fonte` | URL | Original Instagram link |
| `Data` | Date | Date received |

The property names above match the example Inbox configuration. You can use your own names, provided you update the Notion node mappings accordingly.

**Complete setup documentation:** [Instagram Reel to Notion Second Brain — Notion Site](https://paoloronco.notion.site/Documentation-Instagram-Reel-to-Notion-Second-Brain-404f0ba27c3281e1b7e0cd5159fb6bc7?pvs=73). Includes dedicated guides for Telegram, Apify, OpenAI, Notion and end-to-end testing.

## What gets saved

Each Notion entry contains a concise summary and, where supported by the source, key takeaways, mentioned tools, repositories, explicit URLs, practical instructions, potential applications, follow-up actions and material uncertainties. The original Reel link and available author information are retained for reference.

The AI summarizes in **Italian**, preserving relevant product names and technical terminology. Repository names and links are **not independently verified**. The workflow does not invent missing URLs or installation commands.

## Customization

| Node | What to customize |
| --- | --- |
| `04 — Extract & Validate Reel URL` | Supported Instagram URL formats |
| `08 — Start Transcript Run` | Apify Actor configuration, timeout and charge cap |
| `14 — Build AI Prompt` | Summary length, language, caption filtering and entity resolution |
| `OpenAI Chat Model` | Model and API credentials |
| `Structured Output Parser` | JSON schema and allowed categories |
| `17A — Prepare Notion Knowledge Page` | Text limits and Notion content sections |
| `17B — Notion Create Inbox Page` | Database and property mappings |
| `18 — Format Second Brain Reply` | Telegram confirmation wording |

**Important:** Several Code nodes reference other nodes by name. If you rename nodes, update all corresponding expressions and references.

## Limitations and operational notes

- **Instagram only:** YouTube, websites, GitHub URLs and screenshots are not currently supported.
- **No video-frame analysis:** Text or links shown only on screen cannot be extracted by this workflow.
- **No external verification:** Technical claims, repository identities and links come from the available transcript/caption, not independent web checks.
- **No deduplication:** Every submission is processed again, including repeated URLs. This can create duplicate Notion pages and additional API usage.
- **Content availability:** Private, inaccessible, unsupported or speechless videos may fail validation or extraction.
- **No guaranteed recovery:** Review n8n execution history for provider failures or unsuccessful Notion writes. Automatic retries on the paid Actor-launch POST are disabled to reduce duplicate billing risk.
- **Privacy and security:** Keep tokens in n8n credentials, restrict Telegram access, and replace personal user IDs, database IDs and credential references before sharing the workflow JSON publicly.

## Troubleshooting

| Problem | What to check |
| --- | --- |
| Telegram does not trigger | Bot token, allowed user ID, webhook URL and competing active workflows |
| Apify authentication error | Header name `Authorization` and `Bearer ` prefix |
| Actor not found | Current Actor identifier and endpoint |
| Missing caption or transcript | Apify dataset output; some content may not be available |
| OpenAI model or parser error | Available model, credentials and structured output schema |
| Notion database not found | Integration content access, database ID and property types |
| Literal n8n expressions in Notion | Text fields must use Expression mode |
| Telegram message parsing error | HTML parse mode and escaping reserved HTML characters |

For detailed troubleshooting, see the [complete Notion documentation](https://paoloronco.notion.site/Documentation-Instagram-Reel-to-Notion-Second-Brain-404f0ba27c3281e1b7e0cd5159fb6bc7?pvs=73).

## Download and documentation

- [Importable workflow JSON](./Instagram_Reel_to_Notion_Second_Brain.json)
- [Gumroad product page](https://paoloronco.gumroad.com/l/instagram-notion-secondbrain)

## Documentation and links

- [Full documentation and setup guides](https://paoloronco.notion.site/Documentation-Instagram-Reel-to-Notion-Second-Brain-404f0ba27c3281e1b7e0cd5159fb6bc7?pvs=73)
- [n8n templates repository](https://github.com/paoloronco/n8n-templates)
- [n8n Creator profile](https://n8n.io/creators/paoloronco/)
- [Website](https://paoloronco.it)

## Professional services

**Need help implementing, customizing, or building an n8n workflow?**

I offer n8n workflow development, AI integrations, automation consulting and troubleshooting tailored to your requirements.

For consulting and implementation inquiries, contact **[info@paoloronco.it](mailto:info@paoloronco.it)** or visit **[paoloronco.it](https://paoloronco.it)**.

## Origin and attribution

This workflow was **adapted from an imported n8n Creator template** originally designed to analyze Instagram Reels for content creators. The creator-focused analysis was replaced with personal knowledge extraction and Notion storage. **Original template author and listing remain unverified; please establish attribution and license compatibility before redistributing this derivative.**

## Additional information

This workflow is a reusable starting point for a personal knowledge inbox. Future enhancements may include video-frame analysis, external repository verification, persistent deduplication and additional sources such as YouTube, websites and GitHub. Those features are **not included** in this release.

The public workflow JSON is sanitized and disabled by default. It preserves the original node layout and processing logic, with minor safety fixes for the public template. Test it end-to-end with your own credentials and database before regular use. This repository publication is not a guarantee of production reliability.