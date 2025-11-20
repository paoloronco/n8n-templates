# 🤖 n8n Templates [by Paolo Ronco]



A curated collection of **ready-to-use n8n templates** for automations, data extraction, integrations, and notification systems.Includes **free templates**, **detailed technical notes**, and **workflow assets**.



* * *



## 📁 Repository Structure



    📦 n8n-templates

    ├─ README.MD

    ├─ free-templates/

    │  └─ fetch-AmazonLunaGames/

    │     ├─ workflow.json

    │     ├─ README.md

    │     ├─ NOTES-Fetch.md

    │     ├─ NOTES-Notify.md

    │     └─ assets/

    │  └─ SaveInvoices/

    │     ├─ workflow.json

    │     ├─ README.md

    │     └─ assets/

    └─ paid-templates/

       └─ (coming soon)



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

📄 Files included:

* **workflow.json** – Complete n8n importable workflow
* **README.md** – Full setup guide
* **NOTES-Extract.md** – AI extraction logic, parsing, field mapping
* **assets/** – Screenshots, diagrams, previews
  
  
  
  

---



## 💎 Paid Templates (Soon)



    📦 Folder →  

    `/paid-templates/`  

    (Will include previews, documentation, and purchase/activation details.)

This section will host advanced and premium automation templates:

- Multi-platform notification systems  

- Complex data pipelines  

- API scrapers  

- Automation bundles  

- Business integration templates  

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
