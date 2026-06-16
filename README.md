[![Available on GitHub](https://img.shields.io/badge/Available%20on-GitHub-181717?logo=github)](https://github.com/paoloronco/n8n-templates)
[![Available on Gitea](https://img.shields.io/badge/Available%20on-Gitea-609926?logo=gitea)](https://gitea.com/paoloronco/n8n-templates)

# n8n Templates — by Paolo Ronco

A curated collection of ready-to-use [n8n](https://n8n.io) templates for automation, data extraction, integrations, and notification systems. Each template ships with a complete importable workflow, a setup guide, and supporting assets.

![n8n Templates](/assets/n8n-templates.png)

- **Free templates** — fully documented, ready to import.
- **Paid templates** — production-grade, end-to-end automations.
- **My n8n Creator profile:** [n8n.io/creators/paoloronco](https://n8n.io/creators/paoloronco/)

---

## Repository structure

<details>
<summary><strong>Show structure</strong></summary>

```
n8n-templates/
├── free-templates/
│   ├── 1-amazonluna-fetch/
│   ├── 2-SaveInvoices/
│   ├── 3-Certification-Creation&Validation/
│   ├── 3a-Certification-Creation&Validation With PDF Templates/
│   ├── 4-RSS_News_Tech/
│   ├── 5 v1 -online_menu-push_notifications/
│   ├── 5 v2 online_menu-push_notifications-homeassistant-TTS/
│   ├── 5 v3 online_menu-push_notifications-homeassistant-TTS-BACcalculation/
│   └── 6 Sync n8n schedule to GoogleCalendar/
├── paid-templates/
│   ├── 1 - WordPress AI VoiceOvers with Google Cloud/
│   ├── 2 - AI News - Social Publishing Automation/
│   ├── 3 - Reliable Backup & Sync Execution Validation (Log-Driven)/
│   └── 4 - WordPress AI Chatbot/
└── README.md
```

Each template folder typically contains the workflow JSON, a `README.md` setup guide, an `assets/` directory, and — where relevant — additional `docs/` or supporting files.

</details>

---

## Free templates

<details>
<summary><strong>1. Amazon Luna — Fetch "Included with Prime" games and notify</strong></summary>

Automatically fetch and maintain an updated catalog of Amazon Luna "Included with Prime" games. Queries Amazon's official Luna endpoint, extracts the full metadata, and syncs it into Google Sheets without duplicates — then notifies you of changes.

- Folder: [`/free-templates/1-amazonluna-fetch`](./free-templates/1-amazonluna-fetch)
- Deploy guide: [paoloronco.it](https://paoloronco.it/amazon-luna-fetch-included-with-prime-games/)
- n8n template: [Sync Amazon Luna Prime Games to Google Sheets](https://n8n.io/workflows/10733-sync-amazon-luna-prime-games-to-google-sheets-with-automatic-updates/)

</details>

<details>
<summary><strong>2. Save Invoices</strong></summary>

Fetches invoice emails from your ISP or utility provider, downloads the attached PDF, stores it in Google Drive (or FTP/SFTP), extracts the invoice details with AI, and logs everything into Google Sheets.

- Folder: [`/free-templates/2-SaveInvoices`](./free-templates/2-SaveInvoices)
- Deploy guide: [paoloronco.it](https://paoloronco.it/n8n-template-automated-invoice-archiving/)
- n8n template: [Automatic Email Invoice Archiving & Data Extraction](https://n8n.io/workflows/10923-automatic-email-invoice-archiving-and-data-extraction-with-gmail-drive-and-ai/)

</details>

<details>
<summary><strong>3. Certificate Creation & Validation</strong></summary>

A complete end-to-end digital certification system: it automates the full lifecycle of a certificate — creation, PDF generation, and verification via API or a user-friendly HTML page.

- Folder: [`/free-templates/3-Certification-Creation&Validation`](./free-templates/3-Certification-Creation&Validation)
- Deploy guide: [paoloronco.it](https://paoloronco.it/n8n-template-certification-creator-checker/)
- n8n template: [Automated Digital Certificate Creator & Validator](https://n8n.io/workflows/11097-automated-digital-certificate-creator-and-validator-with-pdf-generation/)

</details>

<details>
<summary><strong>3a. Certificate Creation & Validation — with PDF Templates</strong></summary>

The evolved version of template 3. Instead of generating PDFs from raw HTML, it uses **PDF Generator API templates** for a cleaner, more maintainable, and more scalable approach.

Key differences from the HTML version:
- No HTML inside the workflow.
- PDF layout managed through the PDF Generator API template UI.
- Clear separation between automation logic and visual design.
- Easier customization and production-ready structure.

- Folder: [`/free-templates/3a-Certification-Creation&Validation With PDF Templates`](./free-templates/3a-Certification-Creation&Validation%20With%20PDF%20Templates)
- Deploy guide: [paoloronco.it](https://paoloronco.it/n8n-template-certification-creator-checker/)
- n8n template: [Create & Validate Digital Certificates with PDF Generator API](https://n8n.io/workflows/11886-create-and-validate-digital-certificates-with-pdf-generator-api-and-gmail/)

> Recommended for new implementations. The HTML-based version is kept for backward compatibility and educational purposes.

</details>

<details>
<summary><strong>4. Tech News Digest — RSS → AI → Email</strong></summary>

Collects, filters, deduplicates, summarizes, and delivers a daily briefing on technology, AI, and cybersecurity. It ingests ~25 curated RSS feeds, normalizes and caps each source, and uses a resilient multi-model AI chain (OpenAI primary, Gemini fallback, deterministic renderer) to produce a concise HTML newsletter, delivered to a subscriber list via SMTP.

- Folder: [`/free-templates/4-RSS_News_Tech`](./free-templates/4-RSS_News_Tech)
- Deploy guide: [paoloronco.it](https://paoloronco.it/n8n-template-rss-tech-news-to-your-inbox/)
- n8n template: [Curate and Send Tech News Digests with RSS, AI and Email](https://n8n.io/workflows/11466-curate-and-send-tech-news-digests-with-rss-gemini-ai-and-gmail/)

Files: `News_Tech_EN.json` (workflow), `readme.md` (GitHub setup guide), `readme-n8n.md` (n8n marketplace description), `Assets/` (workflow diagram).

</details>

<details>
<summary><strong>5 v1. Online Menu — Push notifications from customer orders</strong></summary>

Receive instant push notifications whenever a customer places an order on your menu website — powered by n8n and a self-hosted ntfy.sh instance. No third-party notification APIs, no paid plans. Includes a ready-to-host static menu website with a customer order page and a password-protected admin panel.

- Folder: [`/free-templates/5 v1 -online_menu-push_notifications`](./free-templates/5%20v1%20-online_menu-push_notifications)
- Documentation: [Menu website — receive notifications from orders](https://paoloronco.notion.site/Documentation-Menu-website-receive-notification-from-orders-32ef0ba27c3280acb9b0f8241a9292f7?pvs=73)

</details>

<details>
<summary><strong>5 v2. Online Menu — Push notifications + Home Assistant voice announcements</strong></summary>

Extends 5 v1: receive a push notification **and** trigger a voice announcement on your Google Home every time an order comes in — powered by n8n, ntfy.sh, and Home Assistant TTS. Fully self-hosted, no cloud TTS fees.

- Folder: [`/free-templates/5 v2 online_menu-push_notifications-homeassistant-TTS`](./free-templates/5%20v2%20online_menu-push_notifications-homeassistant-TTS)
- Documentation: [Menu Order Push Notifications + Home Assistant TTS](https://paoloronco.notion.site/Documentation-Menu-Order-Push-Notifications-Home-Assistant-TTS-32ff0ba27c328073a168ff501c9cf33a)

</details>

<details>
<summary><strong>5 v3. Online Menu — Push notifications + Home Assistant TTS + BAC tracking</strong></summary>

Extends 5 v2 with Blood Alcohol Concentration (BAC) logic on top of push notifications and Home Assistant TTS announcements.

- Folder: [`/free-templates/5 v3 online_menu-push_notifications-homeassistant-TTS-BACcalculation`](./free-templates/5%20v3%20online_menu-push_notifications-homeassistant-TTS-BACcalculation)
- Documentation: [Menu Order Push Notifications + Home Assistant TTS + BAC](https://paoloronco.notion.site/Documentation-Menu-Order-Push-Notifications-Home-Assistant-TTS-BAC-32ff0ba27c328075a886d89ebfbf5ce5?pvs=74)
- n8n template: [Notify on menu orders via ntfy and Home Assistant TTS with daily BAC tracking](https://n8n.io/workflows/14487-notify-on-menu-orders-via-ntfy-and-home-assistant-tts-with-daily-bac-tracking/)

</details>

<details>
<summary><strong>6. Sync n8n schedules to Google Calendar</strong></summary>

Reads every workflow on your n8n instance every 30 minutes, extracts their schedule triggers, and keeps a matching recurring event on Google Calendar — one event per workflow, always in sync.

- Folder: [`/free-templates/6 Sync n8n schedule to GoogleCalendar`](./free-templates/6%20Sync%20n8n%20schedule%20to%20GoogleCalendar)
- Documentation: [n8n Workflow Scheduling Extraction — Setup docs](https://paoloronco.notion.site/n8n-Workflow-Scheduling-Extraction-Setup-Docs-330f0ba27c3280ef99b2c5e8e7dfd497?source=copy_link)
- n8n template: [Sync workflow schedules between Google Sheets and Google Calendar](https://n8n.io/workflows/14397-sync-workflow-schedules-between-google-sheets-and-google-calendar/)

</details>

---

## Paid templates

<details>
<summary><strong>1. WordPress → AI VoiceOver Automation</strong></summary>

Transforms WordPress articles into multilingual, human-sounding audio, powered by n8n, OpenAI, Google Cloud Text-to-Speech (Long Audio), and Google Sheets. Handles text cleaning, translation, long-form TTS generation, WordPress publishing, and status tracking — fully automatic and production-ready.

- Folder: [`/paid-templates/1 - WordPress AI VoiceOvers with Google Cloud`](./paid-templates/1%20-%20WordPress%20AI%20VoiceOvers%20with%20Google%20Cloud)
- n8n template: [Convert WordPress articles to multilingual voiceovers](https://n8n.io/workflows/11789-convert-wordpress-articles-to-multilingual-voiceovers-with-google-tts-and-openai/)
- Gumroad: [WordPress AI VoiceOvers](https://paoloronco.gumroad.com/l/ailfum)
- Shop: [shop.paoloronco.it](https://shop.paoloronco.it/21-n8n-workflow-wordpress-ai-voiceovers-with-google-cloud.html)

</details>

<details>
<summary><strong>2. AI News — Social Publishing Automation</strong></summary>

Collects the latest news from any topic via RSS feeds, analyzes it with AI, and automatically produces ready-to-post Instagram content — title, caption, and AI-generated image. Ideal for creators and brands that want consistent, on-trend social channels without manual content drafting.

- Folder: [`/paid-templates/2 - AI News - Social Publishing Automation`](./paid-templates/2%20-%20AI%20News%20-%20Social%20Publishing%20Automation)
- n8n template: [Automate RSS to Instagram with AI-generated content](https://n8n.io/workflows/11791-automate-rss-to-instagram-with-ai-generated-content-and-cloudinary/)
- Gumroad: [AI News — Social Publishing](https://paoloronco.gumroad.com/l/AInews-SocialPubblishing)
- Shop: [shop.paoloronco.it](https://shop.paoloronco.it/20-n8n-workflow-ai-news-social-publishing-automation.html)

</details>

<details>
<summary><strong>3. Reliable Backup & Sync Execution Validation (Log-Driven)</strong></summary>

Monitors filesystem sync and backup jobs by validating their execution logs — not by running or inspecting the jobs themselves.

Design principles:
- Log-driven, evidence-based monitoring.
- One job = one log = one source of truth.
- No SSH, no server access, no execution coupling.
- Safe to run in untrusted or restricted environments.

- Folder: [`/paid-templates/3 - Reliable Backup & Sync Execution Validation (Log-Driven)`](./paid-templates/3%20-%20Reliable%20Backup%20&%20Sync%20Execution%20Validation%20(Log-Driven))
- n8n template: [Monitor backup and sync logs with GCS, GitHub, Gmail, OpenAI, and GLPI](https://n8n.io/workflows/12880-monitor-backup-and-sync-logs-with-google-cloud-storage-github-gmail-openai-and-glpi/)
- Gumroad: [Backup & Sync Execution Validation](https://paoloronco.gumroad.com/l/ReliableBackup-SyncExecutionValidation)
- Shop: [shop.paoloronco.it](https://shop.paoloronco.it/23-backup-sync-execution-validation-log-driven.html)

> After purchase you receive the `workflow.json`, reference sync-job shell script templates that generate compatible logs, and complete setup documentation.

</details>

<details>
<summary><strong>4. WordPress AI Chatbot</strong></summary>

A production-ready AI chatbot for WordPress sites using n8n, a vector database, and OpenAI. Provides semantic search across your content with Retrieval-Augmented Generation (RAG).

<p align="center">
  <a href="https://paoloronco.gumroad.com/l/wordpress-aichatbot" target="_blank">
    <img src="https://img.shields.io/badge/Buy%20on%20Gumroad-FF90E8?style=for-the-badge&logo=gumroad&logoColor=white" alt="Buy on Gumroad"/>
  </a>
  <a href="https://n8n.io/workflows/13291-build-a-wordpress-rag-chatbot-with-openai-qdrant-or-mongodb/" target="_blank">
    <img src="https://img.shields.io/badge/%20n8n-FF6D5A?style=for-the-badge&logo=n8n&logoColor=white" alt="n8n"/>
  </a>
  <a href="https://shop.paoloronco.it" target="_blank">
    <img src="https://img.shields.io/badge/Paolo%20Ronco%20Shop-0088CC?style=for-the-badge&logo=prestashop&logoColor=white" alt="Shop"/>
  </a>
</p>

Folder: [`/paid-templates/4 - WordPress AI Chatbot`](./paid-templates/4%20-%20WordPress%20AI%20Chatbot) · Video: [YouTube walkthrough](https://www.youtube.com/watch?v=vg33xcdU9gE)

**Key capabilities**
- No coding required — import workflows and configure.
- Semantic search using vector embeddings (Qdrant or MongoDB Atlas).
- Built-in authentication and GDPR-compliant logging (SHA3-256 IP hashing).
- Multilingual support (English and Italian, extensible).
- Works with the free tiers of all required services.

**Features**
- **Intent classification** — routes queries between small talk, content search, and optional profile/skills lookups.
- **Semantic search** — meaning-based retrieval with Cohere reranking and intelligent document chunking.
- **Security** — bearer-token webhook auth, input sanitization, server-side API key management, HTTPS-only.
- **User experience** — responsive chat UI, simple `[wp_ai_chatbot]` shortcode, customizable styling, mobile-optimized.

</details>

---

## Requirements

- n8n (self-hosted or cloud).
- A basic understanding of nodes and credentials.
- Service-specific credentials depending on the template — e.g. Google APIs, OpenAI/Gemini, SMTP, ntfy.sh, or bot tokens. Each template's README lists exactly what it needs.

## How to use a template

1. Open n8n.
2. Import the workflow JSON of your chosen template.
3. Configure the required credentials.
4. Read the template's README (and any `docs/` files) for advanced configuration.
5. Run once manually, then enable the schedule or trigger.

## Useful links

- n8n: https://n8n.io · [Docs](https://docs.n8n.io) · [Community](https://community.n8n.io) · [Node reference](https://docs.n8n.io/integrations/)
- My n8n Creator profile: https://n8n.io/creators/paoloronco/
- My n8n guides: https://paoloronco.it/portfolio/n8n-guides/
- My YouTube n8n playlist: https://www.youtube.com/watch?v=PS6qdCbc5fU&list=PLGQVHrmz2asRssvauRMP2ak3vOG4xDGm9

## About

Maintained by **Paolo Ronco**. Templates aim to be modular, clean, easy to customize, and production-ready.

To contribute, suggest ideas, or request new templates, open an issue. If these templates help you, consider starring the repository — more are on the way.
