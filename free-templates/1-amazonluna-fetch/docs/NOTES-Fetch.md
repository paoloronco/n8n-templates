# 📒 Amazon Luna – Fetch Module

### Complete Guide to Fetching, Parsing & Syncing “Included with Prime” Games

This document explains exactly how the **fetching pipeline** works inside the workflow:  
endpoint details, headers, request body, parsing logic, and Google Sheets synchronization.

---

## 1. 🌐 Endpoint Overview

The workflow uses the same backend endpoint that powers the official Amazon Luna web interface:

```
POST https://proxy-prod.eu-west-1.tempo.digital.a2z.com/getPage
```

This call returns the “Included with Prime” catalog encoded as a large JSON structure containing **GAME_TILE** entries.  
Each GAME_TILE represents a game card with complete metadata.

---

## 2. 📦 Required Headers

To successfully imitate the browser request, the following headers are required:

```
Content-Type: text/plain;charset=UTF-8
Origin: https://luna.amazon.<TLD>
Referer: https://luna.amazon.<TLD>/
x-amz-locale: <locale>            (example: it_IT)
x-amz-platform: web
x-amz-device-type: browser
x-amz-marketplace-id: <marketplace ID>
Accept-Language: it-IT
User-Agent: <your actual browser User-Agent>
```

### 🌍 Supported Regions

| Region       | Locale  | Marketplace ID   |
| ------------ | ------- | ---------------- |
| 🇮🇹 Italy   | `it_IT` | `APJ6JRA9NG5V4`  |
| 🇺🇸 USA     | `en_US` | `ATVPDKIKX0DER`  |
| 🇩🇪 Germany | `de_DE` | `A1PA6795UKMFR9` |
| 🇫🇷 France  | `fr_FR` | `A13V1IB3VIYZZH` |
| 🇪🇸 Spain   | `es_ES` | `A1RKKUPIHCS9HS` |
| 🇬🇧 UK      | `en_GB` | `A1F83G8C2ARO7P` |
| 🇯🇵 Japan   | `ja_JP` | `A1VC38T7YXB528` |
| 🇨🇦 Canada  | `en_CA` | `A2EUQ1WTGCTBG2` |

➡️ To monitor multiple regions, duplicate the sequence:  
**Edit Fields → HTTP Request → Parsing → Sheets**.

---

## 3. 🧠 Request Body (Quick-Search Query)

```json
{
  "timeout": 10000,
  "searchContext": {
    "query": "included_with_prime",
    "sort": "TITLE_A_TO_Z",
    "filtersList": []
  },
  "featureScheme": "WEB_V1",
  "pageContext": {
    "pageType": "multistate_browse_results",
    "pageId": "default"
  },
  "clientContext": {
    "browserMetadata": {
      "browserClientRole": "browser",
      "browserType": "Chrome",
      "browserVersion": "141.0.0.0",
      "deviceModel": "unknown",
      "deviceType": "unknown",
      "osName": "Windows",
      "osVersion": "11"
    }
  },
  "inputContext": {
    "gamepadTypes": []
  },
  "dynamicFeatures": []
}
```

💡 **Important:** Keep User-Agent and OS metadata realistic.  

---

## 4. 🧩 Parsing Logic

The workflow searches for:

```
"type": "GAME_TILE"
```

Extracted fields:

- title  
- asin  
- slug  
- releaseYear  
- genres  
- publishers  
- productUrl  
- imagePortrait  
- imageLandscape  
- ageRating  

---

## 5. 📊 Sync to Google Sheets

- Append or Update  
- Matching column: `title` (or ASIN)  
- Auto-update + auto-insert  
- Zero duplicates  

Supports alternative outputs (Notion, Airtable, SQL, CSV, APIs).

---

## 6. ❗ Troubleshooting

| Issue          | Solution                                        |
| -------------- | ----------------------------------------------- |
| Empty response | Incorrect headers or locale                     |
| Missing games  | Body must contain `query = included_with_prime` |
| 403/5xx        | Update User-Agent & browser metadata            |
| Duplicates     | Use ASIN or Title as unique key                 |
| Parsing errors | Amazon changed JSON schema                      |

---

## 7. ⚖️ Legal Notice

Use for **personal/testing/educational** purposes only.  
Do not republish or redistribute Amazon-owned game catalog data.
