# 🤖 n8n Templates [by Paolo Ronco]



A curated collection of **ready-to-use n8n templates** for automations, data extraction, integrations, and notification systems.Includes **free templates**, **detailed technical notes**, and **workflow assets**.



* * *

## 📁 Repository Structure

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
└── README.md


```



---  

## 🌟 Free Templates

### ▶️ **1. Amazon Luna – Fetch “Included with Prime” Games and send notifications**

Automatically fetch, organize, and maintain an updated catalog of **Amazon Luna – Included with Prime** games. This workflow regularly queries Amazon’s official Luna endpoint, extracts complete metadata, and syncs everything into Google Sheets without duplicates.

📂 **Folder** → [`/free-templates/1-amazonluna-fetch`](./free-templates/1-amazonluna-fetch)

📕Full deploy guide: [Paolo Ronco.it- Full Deploy Guide: Amazon Luna – Fetch “Included with Prime”](https://paoloronco.it/amazon-luna-fetch-included-with-prime-games/)

👥 n8n Community Template: [Sync Amazon Luna Prime Games to Google Sheets with Automatic Updates | n8n workflow template](https://n8n.io/workflows/10733-sync-amazon-luna-prime-games-to-google-sheets-with-automatic-updates/)

📄 Files included:

- **workflow.json** – Complete n8n importable workflow

- **README.md** – Usage guide - **NOTES-Fetch.md**

- Fetch logic, headers, endpoint, parsing - **NOTES-Notify.md**

- Notifications & rate-limit handling - **assets/** – Images, previews, diagrams ---

### ▶️ **2. Save Invoices**

Automated workflow that fetches invoice emails from your ISP or utility provider, downloads the attached PDF, stores it in Google Drive (or optionally on your FTP/SFTP server), extracts all invoice details using AI, and logs everything into Google Sheets.

📂 Folder → [`/free-templates/2-SaveInvoices`](./free-templates/2-SaveInvoices)

📕 Full deploy guide: [[n8n-template] Automated Invoice Archiving &#8211; Paolo Ronco](https://paoloronco.it/n8n-template-automated-invoice-archiving/)

👥 n8n Community Template: [Automatic Email Invoice Archiving & Data Extraction with Gmail, Drive & AI](https://n8n.io/workflows/10923-automatic-email-invoice-archiving-and-data-extraction-with-gmail-drive-and-ai/)

📄 Files included:

* **workflow.json** – Complete n8n importable workflow
* **README.md** – Full setup guide
* **assets/** – Screenshots, diagrams, previews

### ▶️ **3. Certificate Creation&Validation**

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

### ▶️ **Create and Send Tech News Digests with RSS, Gemini AI and Gmail**

This workflow automates the entire lifecycle of collecting, filtering, summarizing, and delivering the most important daily news in **technology, artificial intelligence, cybersecurity, and the digital industry**.  
It functions as a **fully autonomous editorial engine**, combining dozens of RSS feeds, structured data processing, and an LLM (Google Gemini) to transform a large volume of raw articles into a concise, high–value daily briefing delivered straight to your inbox.

📕Full deploy guide: [paoloronco.it - Full deploy guide - Tech & AI Daily Briefing](https://paoloronco.it/n8n-template-rss-tech-news-to-your-inbox/)

👥 n8n Community Template: [Curate and Send Tech News Digests with RSS, Gemini AI and Gmail](https://n8n.io/workflows/11466-curate-and-send-tech-news-digests-with-rss-gemini-ai-and-gmail/)

---

## 💎 Paid Templates

📦 Folder →      `/paid-templates/`  

### ▶️ 1. WordPress → AI VoiceOver Automation (Premium Template)

A full end-to-end automation that transforms your WordPress articles into multilingual, human-sounding audio, powered by n8n, OpenAI, Google Cloud Text-to-Speech (Long Audio), and Google Sheets.
This premium workflow handles everything: text cleaning, translation, long-form TTS generation, WordPress publishing, and complete status tracking — fully automatic and production-ready.

If you want to offer audio versions of your blog posts, boost accessibility, or scale your content distribution, this automation gives you a hands-off, enterprise-grade solution with zero manual work.

🔗 Get the workflow:

[Gumroad](https://paoloronco.gumroad.com/l/ailfum)

[paoloronco.it Shop](https://shop.paoloronco.it/21-n8n-workflow-wordpress-ai-voiceovers-with-google-cloud.html)

[n8n Marketplace - pubblishing soon](Publishing soon)

### ▶️ 2. AI News - Social Publishing Automation

An advanced automation that collects the latest news from **any topic or industry** via RSS feeds, analyzes them with AI, and automatically creates **ready-to-post Instagram content** — complete with title, caption, and AI-generated image.

Ideal for creators, media professionals, and brands that want to keep their social channels **active, consistent, and always on-trend** — without manual research or content drafting.

[Gumroad](https://paoloronco.gumroad.com/l/AInews-SocialPubblishing)

[paoloronco.it Shop]([n8n Workflow: “AI News → Social Publishing Automation”](https://shop.paoloronco.it/20-n8n-workflow-ai-news-social-publishing-automation.html)

[n8n Marketplace](https://n8n.io/workflows/11791-automate-rss-to-instagram-with-ai-generated-content-and-cloudinary/)



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

    - 📚 Documentation: https://docs.n8n.io  

    - 💬 Community Forum: https://community.n8n.io  

    - 🧩 Node Reference: https://docs.n8n.io/integrations/

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

    More templates are coming soon!
