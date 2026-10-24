# n8n Templates — Paolo Ronco

A curated collection of n8n automation workflows, practical implementation guides and reusable assets. Templates are organized by solution, with variants and releases grouped together.

[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?logo=github)](https://github.com/paoloronco/n8n-templates) [![n8n Creators](https://img.shields.io/badge/n8n-Creator_Profile-FF6D5A?logo=n8n)](https://n8n.io/creators/paoloronco/)

![n8n Templates](assets/n8n-templates.png)

## Template catalog

**Free** workflows include importable JSON and setup resources. **Paid** entries retain their existing delivery model; paid workflow JSON files are not publicly distributed here. WordPress Voiceovers is now free; the remaining paid entries retain their existing distribution model.

### Free templates

| Template | Description |
|---|---|
| [WordPress Voiceovers — Google Cloud TTS](./free-templates/wordpress-ai-voiceovers/) | Generate Italian and English WordPress audio with Google Cloud TTS, Translate, and Cloud Run; includes workflow and service code. |\n| [Amazon Luna Prime Games](./free-templates/amazon-luna-prime-games/) | Synchronize included-with-Prime games with Google Sheets. |
| [Invoice Archiving & Data Extraction](./free-templates/invoice-archiving/) | Gmail invoice extraction and archiving (v1 / v2). |
| [Digital Certificate Creation & Validation](./free-templates/digital-certificates/) | HTML/CSS PDF or PDF Generator API variants. |
| [Tech & AI News Digest](./free-templates/tech-ai-news-digest/) | RSS collection, AI ranking, summaries and email delivery. |
| [Menu Order Notifications](./free-templates/menu-order-notifications/) | Basic ntfy, Home Assistant TTS and BAC tracking variants. |
| [Splunk Security Alert Notifications](./free-templates/splunk-alert-notifications/) | Basic notifications and enriched/deduplicated alert processing. |
| [Newsletter & Release Announcements](./free-templates/newsletter-automation/) | Subscriber management, welcomes and GitHub release emails. |
| [Google Cloud Inventory & Change Audit](./free-templates/google-cloud-inventory/) | Resource inventory and change tracking. |
| [Backup & Sync Execution Validation](./free-templates/backup-sync-monitoring/) | Log-driven validation of scheduled backup/sync jobs. |

### Paid templates

| Template | Description |
|---|---|
| [WordPress AI Voiceovers](./paid-templates/wordpress-ai-voiceovers/) | WordPress multilingual voiceovers with AI and Google Cloud TTS. |
| [AI News to Instagram](./paid-templates/ai-instagram-publishing/) | RSS-to-Instagram AI content production. |
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
