# Fetch Amazon Luna Games and send Discord notifications

### Auto-Sync “Included with Prime” Games → Google Sheets with Discord Notifications

Automatically fetch, organize, and maintain an updated catalog of **Amazon Luna – Included with Prime** games. This workflow regularly queries Amazon’s official Luna endpoint, extracts complete metadata, and syncs everything into Google Sheets without duplicates.

Ideal for:

* tracking monthly **Prime Luna rotations**

* keeping a personal archive of games

* monitoring **new games appearing on Amazon Games / Prime Gaming**, so you can instantly play titles you’re interested in

* building dashboards or gaming databases

* powering notification systems (Discord, Telegram, email, etc.)

![workflow](assets/amazonluna-fetch-asset1.png)

📕Full deploy guide:  [Paolo Ronco.it- Full Deploy Guide: Amazon Luna – Fetch “Included with Prime”](https://paoloronco.it/amazon-luna-fetch-included-with-prime-games/)

📽️Video: [Amazon Luna – Fetch “Included with Prime” Games - YouTube](https://youtu.be/PS6qdCbc5fU)

👥 n8n Community Template: [Sync Amazon Luna Prime Games to Google Sheets with Automatic Updates | n8n workflow template](https://n8n.io/workflows/10733-sync-amazon-luna-prime-games-to-google-sheets-with-automatic-updates/)

---

## Overview

Amazon Luna’s “Included with Prime” lineup changes frequently, with new games added and old ones removed.Instead of checking manually, this n8n template fully automates the process:

* Fetches the latest list from Amazon’s backend

* Extracts detailed metadata from the response

* Syncs the data into Google Sheets

* Avoids duplicates by updating existing rows

* Supports all major Amazon regions

Once configured, it runs automatically—keeping your game catalog correct, clean, and always up to

---

## 🧩 Workflow Overview

1. **Schedule Trigger**  
   Starts the workflow on a set schedule (default: every 5 days at 3:00 PM).You can change both frequency and time freely.

2. **HTTP Request → Amazon Luna**  
   Calls Amazon Luna’s regional endpoint and retrieves the full **“Included with Prime”** catalog.

3. **JavaScript Code Node – Data Extraction*** 
   Parses the JSON response and extracts structured fields:
   
   * Title
   
   * Genres
   
   * Release Year
   
   * ASIN
   
   * Image URLs
   
   * Additional metadata
   
   The result is a clean, ready-to-use dataset.

4. **Google Sheets Sync**  
   Each game is written into the selected Google Sheet:
   
   * Existing games get updated
   
   * New games are appended
   
   The **Title** acts as the unique identifier to prevent duplicates.

5. **Optional: Notifications**  
   When new games appear, the workflow fires a message (Discord, Telegram, Email…).

---

## ⚙️ Configuration Parameters

| Parameter                | Description            | Examples                                                               |
| ------------------------ | ---------------------- | ---------------------------------------------------------------------- |
| **x-amz-locale**         | Language/Region        | `it_IT`, `en_US`, `de_DE`, `fr_FR`, `es_ES`, `en_GB`, `ja_JP`, `en_CA` |
| **x-amz-marketplace-id** | Marketplace backend ID | `APJ6JRA9NG5V4` 🇮🇹, `ATVPDKIKX0DER` 🇺🇸, `A1PA6795UKMFR9` 🇩🇪, …   |
| **Accept-Language**      | Response language      | `it-IT,it;q=0.9,en;q=0.8`                                              |
| **User-Agent**           | Browser UA             | Your current browser UA                                                |
| **Trigger interval**     | Refresh frequency      | Default: 5 days at 3:00 PM (modifiable)                                |
| **Google Sheet**         | Where data is stored   | Select file + sheet                                                    |

You can adapt these headers to fetch data from any supported country.

You may duplicate the block (Edit Fields → HTTP Request → Parsing → Sheets) to track multiple countries.

---

## 🔔 Notifications (Optional)

This workflow can automatically send alerts for new games.

Supported outputs:

- Discord (official bot or webhook)
- Telegram Bot API
- Email (SMTP)
- Slack / Microsoft Teams / Matrix / Bark
- Any Webhook

For a complete guide, see **notes-notify.md** in this folder.

---

## 📁 Files Included

- `workflow.json` → the complete n8n workflow  
- `README.md` → this file  
- `notes-fetch.md` → fetch logic, headers, parsing  
- `notes-notify.md` → notifications logic & setup  
- `assets/overview.png` → optional preview image  

---

## 🗎 Extra Docs

- [Fetch Notes](docs/NOTES-Fetch.md)
- [Notify Notes](docs/NOTES-Notify.md)

---

## 🔒 Important Notes

- All data belongs to Amazon.  
- This workflow is for **personal / testing / educational** use only.  
- Do **not** republish or redistribute the full game list.  
- Amazon may change internal APIs anytime, so re-check headers/body when needed.

---
