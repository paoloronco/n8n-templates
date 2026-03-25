# Setup the n8n Workflow

## Architecture

```
Your Menu Website
      ↓  POST /webhook/menu
  n8n Webhook node
      ↓
  HTTP Request → http://ntfy/YOUR_TOPIC
      ↓
  📱 Push notification on phone
```

---

## Step 1 — Import the Workflow

1. Open n8n
2. Click **Add workflow** → **Import from file**
3. Select `workflow/menu-order-notifications.json`

---

## Step 2 — Create the ntfy Credential

1. Go to **Settings → Credentials → Add credential**
2. Select **Header Auth**
3. Fill in:
   - **Name:** `HeaderAuth ntfy`
   - **Name (header):** `Authorization`
   - **Value:** `Bearer YOUR_NTFY_TOKEN`

> The token is generated with `docker exec ntfy ntfy token add admin` (see [Setup ntfy](01-setup-ntfy.md)).

---

## Step 3 — Configure the HTTP Request Node

Open the `ntfy notification` node and update:

| Field | Value |
|---|---|
| URL | `http://ntfy/YOUR_TOPIC_NAME` (internal Docker URL) or `https://ntfy.YOUR_DOMAIN.com/YOUR_TOPIC_NAME` |
| Authentication | Generic Credential Type → Header Auth → select your credential |

> **Use the internal Docker URL** (`http://ntfy/`) if n8n and ntfy are on the same Docker network. It's faster and doesn't go through the internet.

> **Critical:** Keep `contentType: raw` with `rawContentType: text/plain`. Do NOT switch to JSON body — n8n won't set the Content-Type correctly and ntfy will receive raw JSON as the notification text instead of parsing the headers.

---

## Step 4 — Activate the Workflow

Click **Active** toggle in the top-right corner. The webhook is now live at:

```
https://YOUR_N8N_DOMAIN/webhook/menu
```

---

## Expected Webhook Payload

Your website should POST this JSON to the webhook URL:

```json
{
  "nome": "Mario",
  "orario": "25/03/2026, 10:50:21",
  "ordine": [
    {
      "sezione": "Beers",
      "nome": "Messina",
      "dettaglio": "33cl",
      "quantita": 1
    },
    {
      "sezione": "Food",
      "nome": "Margherita Pizza",
      "dettaglio": "",
      "quantita": 2
    }
  ],
  "totale": 3
}
```

---

## Resulting Notification

```
🛎 Order from Mario
──────────────────
Name: Mario | 1x Messina 33cl | 2x Margherita Pizza
🕐 25/03/2026, 10:50:21
```

---

## Mobile App Setup

1. Install **ntfy** ([Android](https://play.google.com/store/apps/details?id=io.heckel.ntfy) / [iOS](https://apps.apple.com/app/ntfy/id1625396347))
2. **Settings → Manage servers → Add server**
   - URL: `https://ntfy.YOUR_DOMAIN.com`
   - Username: `admin`
   - Password: your admin password
3. **Subscribe to topic** → `YOUR_TOPIC_NAME`

> Set the credentials on the **server**, not on the individual topic.

---

## Customizing the Notification Body

The body expression in the HTTP Request node:

```javascript
={{
  'Name: ' + $json.body.nome + ' | ' +
  $json.body.ordine
    .map(i =>
      i.quantita + 'x ' +
      i.nome + ' ' +
      i.dettaglio
    )
    .join(' | ') +
  '\n🕐 ' +
  $json.body.orario
}}
```

Adapt field names (`nome`, `ordine`, `orario`, etc.) to match your own webhook payload schema.
