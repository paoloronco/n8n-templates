# 03 — Setup the n8n Workflow

Import and configure the menu order workflow in n8n (v3 — DataTable + BAC).

---

## Prerequisites

- A running n8n instance
- ntfy set up and a Bearer token ready (see `01-setup-ntfy.md`)
- *(Optional)* A Home Assistant instance with a TTS script

---

## Step 1 — Create the DataTable

1. In n8n go to **Data → Tables → Create table**
2. Name it (e.g. `menu paoloronco intranet`)
3. Add these columns:

| Column name | Type |
|---|---|
| `item` | Text |
| `person` | Text |
| `alcol_grammi` | Number |
| `data` | Text |
| `orario` | Text |

4. Copy the DataTable ID from the browser URL — you'll need it in step 3.

---

## Step 2 — Import the Workflow

1. In n8n go to **Workflows → Import from file**
2. Select `7 🍸 intranet menu-paoloroncoit v3.1 PUBLIC.json`
3. The workflow will import with placeholder values — configure them in the next step

---

## Step 3 — Configure the Nodes

### Log Ordine DB & Read Today

Both DataTable nodes need your real DataTable ID:

- Open **Log Ordine DB** → `dataTableId` → replace `YOUR_DATATABLE_ID`
- Open **Read Today** → `dataTableId` → replace `YOUR_DATATABLE_ID`

### ntfy notification

- Open the **ntfy notification** HTTP Request node
- Set the URL to `http://YOUR_NTFY_SERVER/YOUR_NTFY_TOPIC`
  - If ntfy is on the same Docker network: `http://ntfy/paoloronco-menu`
  - If external: `https://ntfy.yourdomain.com/paoloronco-menu`
- Create a **Header Auth** credential:
  - Header Name: `Authorization`
  - Header Value: `Bearer YOUR_NTFY_TOKEN`
- Attach the credential to this node

### Call a service (Home Assistant TTS — optional)

- Open the **Call a service** Home Assistant node
- Set `service` to your HA script name (e.g. `annuncia_ordine`)
- Create a **Home Assistant API** credential with your HA URL and token
- Attach the credential to this node
- If you don't use Home Assistant: **delete this node** (disconnect it from ntfy notification first)

---

## Step 4 — Activate and Get Webhook URL

1. Click **Activate** (toggle in the top-right of the workflow editor)
2. Open the **Webhook** node
3. Copy the **Production URL** (e.g. `https://n8n.yourdomain.com/webhook/menu`)

---

## Step 5 — Configure the Menu Website

In `menu-data.js` (or via `admin.html`):

```javascript
window.MENU_DATA = {
  "title": "Your Restaurant",
  "orderWebhook": "https://n8n.yourdomain.com/webhook/menu",
  // ...
};
```

Make sure every item has `alcol_grammi` set (grams of pure alcohol per serving, `0` for non-alcoholic).

---

## Workflow Nodes Reference

| Node | Type | Purpose |
|---|---|---|
| Webhook | Webhook | Receives POST from menu website |
| Prepare Order | Code | Normalises name (case-insensitive), calculates `alcolOrdine` |
| Log Ordine DB | DataTable (insert) | Saves order row to DataTable |
| Read Today | DataTable (get) | Reads all rows for this person today |
| BAC Calculator | Code | Calculates cumulative BAC (Widmark formula) |
| ntfy notification | HTTP Request | Sends push notification to ntfy |
| Call a service | Home Assistant | Calls HA TTS script (optional) |

---

## Resetting BAC

Delete rows from the DataTable via **n8n → Data → Tables → your table**. The next day BAC starts from zero automatically (filter: `data = today`).

---

## Testing

Send a test POST to the webhook (replace with your Production URL):

```bash
curl -X POST https://n8n.yourdomain.com/webhook/menu \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Test",
    "orario": "21:00",
    "ordine": [
      { "nome": "Negroni", "dettaglio": "", "quantita": 1, "alcol_grammi": 19 }
    ],
    "totale": 1
  }'
```

Check the ntfy app for the notification. Check the DataTable for the saved row.
