# 🤖 n8n Templates [by Paolo Ronco]



A curated collection of **ready-to-use n8n templates** for automations, data extraction, integrations, and notification systems.Includes **free templates**, **detailed technical notes**, and **workflow assets**.

![image](/assets/n8n-templates.png)



* * *
## 📁 Repository Structure
<details>
<summary><strong>Repository Structure/</strong></summary>


```
.
n8n-templates/
├── free-templates/
│   ├── 1-amazonluna-fetch/
│   │   ├── assets/
│   │   │   └── amazonluna-fetch-asset1.png
│   │   ├── docs/
│   │   │   ├── NOTES-Fetch.md
│   │   │   └── NOTES-Notify.md
│   │   ├── README.md
│   │   └── workflow.json
│   ├── 2-SaveInvoices/
│   │   ├── assets/
│   │   │   └── SaveInvoices-Asset1.png
│   │   ├── README.md
│   │   └── workflow.json
│   ├── 3-Certification-Creation&Validation/
│   │   ├── Assets/
│   │   │   ├── Example-Certificate.pdf
│   │   │   └── Workflow-image.png
│   │   ├── Cetificate-Creation&Validation.json
│   │   ├── HTML-Files/
│   │   │   ├── Cerification_Check.html
│   │   │   └── Certificate.html
│   │   └── README.md
│   ├── 3a-Certification-Creation&Validation With PDF Templates/
│   │   ├── Assets/
│   │   │   ├── Example-Certificate.pdf
│   │   │   └── Workflow-image.png
│   │   ├── Cetificate-Creation&ValidationWithTemplates.json
│   │   ├── PDFgeneratorAPI-Templates/
│   │   │   └── template_export_1560735.json
│   │   └── README.md
│   └── 4-RSS_News_Tech/
│       ├── Assets/
│       │   └── workflow.png
│       ├── News_Tech_EN.json
│       └── readme.md
├── paid-templates/
│   └── 1 - WordPress AI VoiceOvers with Google Cloud/
│       ├── assets/
│       │   ├── banner.png
│       │   ├── Github-paoloronco-Lynx.mp3
│       │   ├── GitHubPagesWebsite.mp3
│       │   └── n8n-template-fetch-amazonlunagames.mp3
│       └── README.md
│   └── 2 - AI News - Social Publishing Automation
│       ├── assets/
│       │   ├── banner.png
│       └── README.md
│   └── 3 - Reliable Backup & Sync Execution Validation (Log-Driven)
│       ├── assets/
│       │   ├── 
│       └── README.md
│   └── 4 - WordPress AI Chatbot/
│       ├── assets/
│       |   ├── promotional.png
│       |   ├── promotional-banner.png
│       |   ├── promotional-square.png
│       |   └── amazonluna-fetch-asset1.png
│       |   └── frontend/
│       |       ├── MicroWebsite.png
│       |       └── WP-ChatBot/
│       |           ├── WP-AI_ChatBot-SmallTalk.png
│       |           ├── WP-AI_ChatBot-RAG.png
│       |           ├── WP-AI_ChatBot-Skills_MongoDB.png
│       ├── FEATURES.md
│       ├── LICENSE.md
│       ├── README.md
└── README.md

```

</details>

---

## 🌟 Free Templates

<details>
<summary>▶️ 1. Amazon Luna – Fetch “Included with Prime” Games and send notifications</summary>

Automatically fetch, organize, and maintain an updated catalog of **Amazon Luna – Included with Prime** games. This workflow regularly queries Amazon’s official Luna endpoint, extracts complete metadata, and syncs everything into Google Sheets without duplicates.

📂 **Folder** → [`/free-templates/1-amazonluna-fetch`](./free-templates/1-amazonluna-fetch)

📕Full deploy guide: [Paolo Ronco.it- Full Deploy Guide: Amazon Luna – Fetch “Included with Prime”](https://paoloronco.it/amazon-luna-fetch-included-with-prime-games/)

👥 n8n Community Template: [Sync Amazon Luna Prime Games to Google Sheets with Automatic Updates | n8n workflow template](https://n8n.io/workflows/10733-sync-amazon-luna-prime-games-to-google-sheets-with-automatic-updates/)

📄 Files included:

- **workflow.json** – Complete n8n importable workflow

- **README.md** – Usage guide - **NOTES-Fetch.md**

- Fetch logic, headers, endpoint, parsing - **NOTES-Notify.md**

- Notifications & rate-limit handling - **assets/** – Images, previews, diagrams ---

</details>



<details>
<summary>▶️ 2. Save Invoices</summary>

Automated workflow that fetches invoice emails from your ISP or utility provider, downloads the attached PDF, stores it in Google Drive (or optionally on your FTP/SFTP server), extracts all invoice details using AI, and logs everything into Google Sheets.

📂 Folder → [`/free-templates/2-SaveInvoices`](./free-templates/2-SaveInvoices)

📕 Full deploy guide: [[n8n-template] Automated Invoice Archiving &#8211; Paolo Ronco](https://paoloronco.it/n8n-template-automated-invoice-archiving/)

👥 n8n Community Template: [Automatic Email Invoice Archiving & Data Extraction with Gmail, Drive & AI](https://n8n.io/workflows/10923-automatic-email-invoice-archiving-and-data-extraction-with-gmail-drive-and-ai/)

📄 Files included:

* **workflow.json** – Complete n8n importable workflow
* **README.md** – Full setup guide
* **assets/** – Screenshots, diagrams, previews

</details>



<details>
<summary>▶️ 3. Certificate Creation&Validation</summary>

Automated workflow for a complete **end-to-end certification management system built with n8n**.
It automates the entire lifecycle of a digital certificate — from creation, to PDF generation, to verification via API or a user-friendly HTML page.

📂 Folder → [`/free-templates/4-RSS_News_Tech`](./free-templates/4-RSS_News_Tech)

📕 Full deploy guide: [[n8n-template] Certification Creator](https://paoloronco.it/n8n-template-certification-creator-checker/)

👥 n8n Community Template: [Automated Digital Certificate Creator & Validator with PDF Generation](https://n8n.io/workflows/11097-automated-digital-certificate-creator-and-validator-with-pdf-generation/)

📄 Files included:

* **workflow.json** – Complete n8n importable workflow
* **README.md** – Full setup guide
* **HTML Files** – Example HTML templates
* **assets/** – Screenshots, diagrams, previews

</details>

<details>
<summary>▶️ 3a. Certificate Creation&Validation with PDF Templates</summary>

This is the **evolved version** of the original *Certificate Creation & Validation* workflow.

Instead of generating PDFs from raw HTML, this version uses **PDF Generator API templates**, providing a cleaner, more maintainable, and more scalable approach.

**Key differences from the HTML version:**

- No HTML inside the workflow
- PDF layout managed via **PDF Generator API Template UI**
- Clear separation between automation logic and visual design
- Easier customization and collaboration
- Production-ready structure

📂 Folder →
 `/free-templates/3a-Certification-Creation&Validation-With-PDF-Templates`

📕 Full deploy guide:
 [n8n Template – Certificate Creator & Checker (PDF Templates)](https://paoloronco.it/n8n-template-certification-creator-checker/)

👥 n8n Community Template: [Create & Validate Digital Certificates with PDF Generator API and Gmail](https://n8n.io/workflows/11886-create-and-validate-digital-certificates-with-pdf-generator-api-and-gmail/)

📄 Files included:

- **workflow.json** – Complete n8n importable workflow
- **README.md** – Full setup and usage guide
- **PDF Template** ***JSON***– Ready-to-use PDF Generator API template
- **assets/** – Diagrams, previews, and example output

> 💡 This version is recommended for new implementations.
>  The HTML-based workflow is kept for backward compatibility and educational purposes.

</details>



<details>
<summary>▶️ 4. Create and Send Tech News Digests with RSS, Gemini AI and Gmail </summary>


This workflow automates the entire lifecycle of collecting, filtering, summarizing, and delivering the most important daily news in **technology, artificial intelligence, cybersecurity, and the digital industry**.  
It functions as a **fully autonomous editorial engine**, combining dozens of RSS feeds, structured data processing, and an LLM (Google Gemini) to transform a large volume of raw articles into a concise, high–value daily briefing delivered straight to your inbox.

📕Full deploy guide: [paoloronco.it - Full deploy guide - Tech & AI Daily Briefing](https://paoloronco.it/n8n-template-rss-tech-news-to-your-inbox/)

👥 n8n Community Template: [Curate and Send Tech News Digests with RSS, Gemini AI and Gmail](https://n8n.io/workflows/11466-curate-and-send-tech-news-digests-with-rss-gemini-ai-and-gmail/)

</details>



---

## 💎 Paid Templates

📦 Folder →      `/paid-templates/`  

<details>
<summary>▶️ 1. WordPress → AI VoiceOver Automation (Premium Template)</summary>

A full end-to-end automation that transforms your WordPress articles into multilingual, human-sounding audio, powered by n8n, OpenAI, Google Cloud Text-to-Speech (Long Audio), and Google Sheets.
This premium workflow handles everything: text cleaning, translation, long-form TTS generation, WordPress publishing, and complete status tracking — fully automatic and production-ready.

If you want to offer audio versions of your blog posts, boost accessibility, or scale your content distribution, this automation gives you a hands-off, enterprise-grade solution with zero manual work.

**🔗 Get the workflow:**

- 📂 Folder → [`/paid-templates/1 - WordPress AI VoiceOvers with Google Cloud`](./paid-templates/1 - WordPress AI VoiceOvers with Google Cloud)

- 👥 n8n Community Template: [Convert WordPress articles to multilingual voiceovers with Google TTS and OpenAI](https://n8n.io/workflows/11789-convert-wordpress-articles-to-multilingual-voiceovers-with-google-tts-and-openai/)

- 🛍️ GumRoad:  [WordPress AI VoiceOvers](https://paoloronco.gumroad.com/l/ailfum)

- 🛍️ Paolo Ronco Shop [paoloronco.it Shop](https://shop.paoloronco.it/21-n8n-workflow-wordpress-ai-voiceovers-with-google-cloud.html)

[n8n Marketplace](https://n8n.io/workflows/11789-convert-wordpress-articles-to-multilingual-voiceovers-with-google-tts-and-openai/)

</details>



<details>
<summary>▶️ 2. AI News - Social Publishing Automation</summary>

An advanced automation that collects the latest news from **any topic or industry** via RSS feeds, analyzes them with AI, and automatically creates **ready-to-post Instagram content** — complete with title, caption, and AI-generated image.

Ideal for creators, media professionals, and brands that want to keep their social channels **active, consistent, and always on-trend** — without manual research or content drafting.

🔗 Get the workflow:

- 📂 Folder → [`/paid-templates/2 - AI News - Social Publishing Automation`](./paid-templates/2 - AI News - Social Publishing Automation)

- 👥 n8n Community Template: [2. AI News - Social Publishing Automation](https://n8n.io/workflows/11791-automate-rss-to-instagram-with-ai-generated-content-and-cloudinary/)

- 🛍️ GumRoad [AI News Social pubblishing](https://paoloronco.gumroad.com/l/AInews-SocialPubblishing)

- 🛍️ Paolo Ronco Shop [n8n Workflow: “AI News → Social Publishing Automation”](https://shop.paoloronco.it/20-n8n-workflow-ai-news-social-publishing-automation.html)

</details>



<details>
<summary>▶️ 3. Reliable Backup & Sync Execution Validation (Log-Driven) </summary>

This workflow monitors filesystem sync and backup jobs by **validating their execution logs**, not by running or inspecting the jobs themselves.

**Key design principles**

* Log-driven monitoring (evidence-based, not assumption-based)
* One job = one log = one source of truth
* No SSH, no server access, no execution coupling
* Safe to run in untrusted or restricted environments

**🔗 Get the workflow:**

- 📂 Folder → [`/paid-templates/3 - Reliable Backup & Sync Execution Validation (Log-Driven)`](./paid-templates/3 - Reliable Backup & Sync Execution Validation (Log-Driven))

- 👥 n8n Community Template: [Monitor backup and sync logs with Google Cloud Storage, GitHub, Gmail, OpenAI, and GLPI](https://n8n.io/workflows/12880-monitor-backup-and-sync-logs-with-google-cloud-storage-github-gmail-openai-and-glpi/)

- 🛍️ GumRoad: [Backup & Sync Execution Validation Log Driven](https://paoloronco.gumroad.com/l/ReliableBackup-SyncExecutionValidation)

- 🛍️ Paolo Ronco Shop  [[Backup & Sync Execution Validation Log Driven]](https://shop.paoloronco.it/23-backup-sync-execution-validation-log-driven.html)](https://shop.paoloronco.it/23-backup-sync-execution-validation-log-driven.html)

> **After purchase, you will receive a complete package including:**
>
> - **`workflow.json`** – ready to be imported into n8n
> - **Shell script templates (`.sh`)** – reference sync job templates designed to generate structured logs fully compatible with the workflow
> - **Complete setup documentation** – step-by-step guide covering configuration, deployment, and operational requirements

</details>



<details>
<summary>▶️ 4. WordPress AI Chatbot </summary>
A production-ready AI chatbot for WordPress sites using n8n workflows, vector databases, and OpenAI. Provides semantic search across your content with RAG (Retrieval-Augmented Generation).
<p align="center">
  <a href="https://paoloronco.gumroad.com/l/wordpress-aichatbot" target="_blank">
    <img src="https://img.shields.io/badge/Buy%20on%20Gumroad-FF90E8?style=for-the-badge&logo=gumroad&logoColor=white" alt="Buy on Gumroad"/>
  </a>
  <a href="https://n8n.io/workflows/13291-build-a-wordpress-rag-chatbot-with-openai-qdrant-or-mongodb/" target="_blank">
    <img src="https://img.shields.io/badge/%20n8n-FF6D5A?style=for-the-badge&logo=n8n&logoColor=white" alt="n8n"/>
  </a>
  <a href="https://shop.paoloronco.it" target="_blank">
    <img src="https://img.shields.io/badge/Paolo%20Ronco%20Shop-0088CC?style=for-the-badge&logo=prestashop&logoColor=white" alt="Our Store"/>
  </a>
</p>


📂 Folder → [`/paid-templates/4 - WordPress AI Chatbot)`](./paid-templates/4 - WordPress AI Chatbot)

**Overview**

This is a complete AI chatbot solution for WordPress websites, powered by n8n automation workflows. It uses semantic search to understand user questions and provides accurate answers based on your actual WordPress content.

**Key capabilities:**

- No coding required - import workflows and configure
- Semantic search using vector embeddings
- Choice of vector databases (Qdrant or MongoDB Atlas)
- Built-in authentication and GDPR-compliant logging
- Multilingual support (English and Italian, extensible)
- Works with free tiers of all required services

**Features**

- **Intent Classification**
  The chatbot routes queries intelligently:

  - **Small Talk** - Casual conversations, greetings

  - **Content Search** - Semantic search across WordPress posts

  - **Profile/Skills** - Optional database for expertise/experience queries


- **Semantic Search**

  - Vector embeddings for meaning-based search (not just keywords)

  - Reranking with Cohere for improved relevance

  - Combines multiple sources for comprehensive answers

  - Intelligent document chunking


- **Security**

  - Bearer token authentication for webhooks

  - GDPR-compliant IP hashing (SHA3-256)

  - Input sanitization

  - Server-side API key management

  - HTTPS-only communication


- **User Experience**

  - Modern, responsive chat interface

  - Simple WordPress shortcode integration: `[wp_ai_chatbot]`

  - Customizable colors and styling

  - Mobile-optimized



</details>




---

---

---



## 🔧 Requirements

- **n8n** (self-hosted or cloud)  

- Basic understanding of nodes & credentials  

- For some workflows:  

  - Google Sheets API credentials  

  - Discord/Telegram bot tokens  

  - Webhooks or API secrets  



## ✨ How to Use These Templates

       1. Open n8n  
                2. Import the `workflow.json` file of your chosen template  
                            3. Configure credentials (Google, Discord, etc.)  
                                        4. Read the included NOTES files for advanced configuration  
                                            5. Run once manually → then enable scheduled execution  



## 🔗 Useful Links

   - 🌐 n8n Website: https://n8n.io  
        - [My n8n Creator profile & templates](https://n8n.io/creators/paoloronco/)
        - 📚 Documentation: https://docs.n8n.io  
        - 💬 Community Forum: https://community.n8n.io  
        - 🧩 Node Reference: https://docs.n8n.io/integrations/

   - my n8n Guides: [paoloronco.it Website - n8n Guides](https://paoloronco.it/portfolio/n8n-guides/)
   - my [YouTube Channel n8n Playlist](https://www.youtube.com/watch?v=PS6qdCbc5fU&list=PLGQVHrmz2asRssvauRMP2ak3vOG4xDGm9)



## 🧑‍💻 About This Repository

    This project is maintained by **Paolo Ronco**.  

    Templates aim to be:

   - modular  
   - clean  
   - easy to customize  
   - production-ready  

 If you want to contribute, suggest ideas, or request new templates, feel free to open an issue.    



## ⭐ Support the Project

    If these templates help you automate your workflows, consider starring the repo ⭐  

    **More templates are coming soon!**
