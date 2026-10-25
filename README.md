# n8n Templates — Paolo Ronco

A curated collection of n8n automation workflows, practical implementation guides and reusable assets. Templates are organized by solution, with variants and releases grouped together.

[![Personal Website](https://img.shields.io/badge/PaoloRonco.it-Website-2563EB?logo=googlechrome&logoColor=white&style=for-the-badge)](https://paoloronco.it/) [![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?logo=github)](https://github.com/paoloronco/n8n-templates) [![n8n Creators](https://img.shields.io/badge/n8n-Creator_Profile-FF6D5A?logo=n8n)](https://n8n.io/creators/paoloronco/) [![Gumroad](https://img.shields.io/badge/Gumroad-Store-FF90E8?logo=gumroad&logoColor=black)](https://paoloronco.gumroad.com/)

![n8n Templates](assets/n8n-templates.png)

## Template catalog

**Free** workflows include importable JSON and setup resources. **Paid** templates retain their existing delivery model; their workflow JSON files are not publicly distributed here.

### Free templates

| Template | Description |
|---|---|
| [WordPress AI Chatbot — RAG](./free-templates/wordpress-rag-chatbot/) | Bilingual WordPress chatbot with Qdrant semantic search, OpenAI, Cohere reranking and optional MongoDB Atlas skills retrieval. [Documentation](https://paoloronco.notion.site/WordPress-AI-Chatbot-404f0ba27c3281c796fbfc177b050bef) · [n8n Creators](https://n8n.io/workflows/13291-build-a-wordpress-rag-chatbot-with-openai-qdrant-or-mongodb/) · [Gumroad](https://paoloronco.gumroad.com/l/wordpress-aichatbot). |\n| [AI News to Instagram](./free-templates/ai-instagram-publishing/) | RSS-to-Instagram AI content production. [n8n Creators](https://n8n.io/workflows/11791-automate-rss-to-instagram-with-ai-generated-content-and-cloudinary/) · [Documentation](https://paoloronco.notion.site/Documentation-n8n-RSS-AI-Instagram-Publishing-3f5f0ba27c32806ba425f7d84c72961a?pvs=74) · [Gumroad](https://paoloronco.gumroad.com/l/AInews-SocialPubblishing). |
| [WordPress Voiceovers — Google Cloud TTS](./free-templates/wordpress-ai-voiceovers/) | Generate multilingual WordPress audio with Google Cloud TTS and Translate. [Free download](https://paoloronco.gumroad.com/l/wordpress-voiceovers) · [n8n Creators](https://n8n.io/workflows/11789-convert-wordpress-articles-to-multilingual-voiceovers-with-google-tts-and-openai/) (legacy listing). |
| [Amazon Luna Prime Games](./free-templates/amazon-luna-prime-games/) | Synchronize included-with-Prime games with Google Sheets. |
| [Invoice Archiving & Data Extraction](./free-templates/invoice-archiving/) | Gmail invoice extraction and archiving (v1 / v2). |
| [Digital Certificate Creation & Validation](./free-templates/digital-certificates/) | HTML/CSS PDF or PDF Generator API variants. |
| [Tech & AI News Digest](./free-templates/tech-ai-news-digest/) | RSS collection, AI ranking, summaries and email delivery. |
| [Instagram Reel to Notion Second Brain](./free-templates/instagram-reel-second-brain/) | Save public Instagram Reels as structured Notion knowledge using Telegram, Apify and OpenAI. Italian and English output variants available. [Gumroad](https://paoloronco.gumroad.com/l/instagram-notion-secondbrain) · [Setup guide](https://paoloronco.notion.site/Documentation-Instagram-Reel-to-Notion-Second-Brain-404f0ba27c3281e1b7e0cd5159fb6bc7?pvs=73). |
| [Menu Order Notifications](./free-templates/menu-order-notifications/) | Basic ntfy, Home Assistant TTS and BAC tracking variants. |
| [Splunk Security Alert Notifications](./free-templates/splunk-alert-notifications/) | Basic notifications and enriched/deduplicated alert processing. |
| [Newsletter & Release Announcements](./free-templates/newsletter-automation/) | Subscriber management, welcomes and GitHub release emails. |
| [Google Cloud Inventory & Change Audit](./free-templates/google-cloud-inventory/) | Resource inventory and change tracking. |
| [Backup & Sync Execution Validation](./free-templates/backup-sync-monitoring/) | Log-driven validation of scheduled backup/sync jobs. |

### Paid templates

| Template | Description |
|---|---|
| [WordPress RAG Chatbot](./paid-templates/wordpress-rag-chatbot/) | RAG chatbot for WordPress websites. |
| [Website RAG Chatbot](./paid-templates/website-rag-chatbot/) | Website chatbot backend using Qdrant and AI. |

## Folder conventions

- `free-templates/` and `paid-templates/` remain separate until the distribution model changes.
- Solution directories use descriptive, lowercase kebab-case names without numeric prefixes.
- Functional alternatives use descriptive names (e.g. `basic/`, `home-assistant-tts/`); successive releases use `v1/`, `v2/`.
- Each solution has a README with variant selection, import instructions and relevant resources. Existing assets, examples and supporting documentation are retained.
- For menu order notifications, shared website mockups and common setup documentation live once in the solution folder.

## Importing a workflow

1. Open the relevant template folder and read its README.
2. Download the applicable workflow JSON (free templates) or obtain the paid package through its linked distribution channel.
3. Import the JSON into n8n and configure credentials, endpoints and environment-specific values.
4. Test manually before activating production triggers.

## Professional services

Need help implementing or adapting these workflows to your environment? For consulting and implementation inquiries, contact [info@paoloronco.it](mailto:info@paoloronco.it) or visit [paoloronco.it](https://paoloronco.it).

## Resources

- [n8n Creator profile](https://n8n.io/creators/paoloronco/)
- [n8n guides](https://paoloronco.it/portfolio/n8n-guides/)
- [n8n documentation](https://docs.n8n.io/)

Maintained by [Paolo Ronco](https://paoloronco.it).
