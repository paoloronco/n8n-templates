# Setup the n8n Workflow

📖 **Full documentation:** [Notion](https://paoloronco.notion.site/Documentation-Menu-Order-Push-Notifications-Home-Assistant-TTS-32ff0ba27c328073a168ff501c9cf33a)

---

## Architecture

```
Your Menu Website
      ↓  POST /webhook/menu
  n8n Webhook node
      ↓
  ntfy notification → 📱 Push notification
      ↓
  DB (order log)
      ↓
  Home Assistant TTS → 🔊 Google Home announcement
```

---

## Step 1 — Import the Workflow

1. Open n8n
2. Click **Add workflow** → **Import from file**
3. Select `workflow/menu-order-notifications-with-tts.json`

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

## Step 3 — Create the Home Assistant Credential

1. Go to **Settings → Credentials → Add credential**
2. Select **Home Assistant**
3. Fill in:
   - **Host:** `http://homeassistant.local:8123`
   - **Access Token:** your HA Long-lived token (see [Setup Home Assistant TTS](04-setup-homeassistant-tts.md))
4. Save as `Home Assistant - Local`

---

## Step 4 — Configure the ntfy Node

Open the `ntfy notification` node and update:

| Field | Value |
|---|---|
| URL | `http://ntfy/YOUR_TOPIC_NAME` (internal Docker) or `https://ntfy.YOUR_DOMAIN.com/YOUR_TOPIC_NAME` |
| Authentication | Generic Credential Type → Header Auth → `HeaderAuth ntfy` |

> Use the internal Docker URL (`http://ntfy/`) if n8n and ntfy are on the same Docker network.

> Keep `contentType: raw` with `rawContentType: text/plain`.

---

## Step 5 — Configure the Home Assistant TTS Node

Open the `Home Assistant TTS` node and set:

| Field | Value |
|---|---|
| Credential | `Home Assistant - Local` |
| Resource | `Service` |
| Operation | `Call` |
| Domain | `script` |
| Service | `annuncia_ordine` |

Add one row in **Service Attributes**:

| Name | Value |
|---|---|
| `message` | `={{ $('Webhook').item.json.body.nome + ' has ordered ' + $('Webhook').item.json.body.ordine[0].nome }}` |

> This announces e.g. _"Mario has ordered Pizza"_ when Mario places an order.

---

## Step 6 — Activate the Workflow

Click the **Active** toggle in the top-right. The webhook is now live at:

```
https://YOUR_N8N_DOMAIN/webhook/menu
```

Copy this URL and set it as `orderWebhook` in your menu website's `menu-data.js`.

---

## Expected Webhook Payload

Your website should POST this JSON to the webhook URL:

```json
{
  "nome": "Mario",
  "orario": "26/03/2026, 12:30:00",
  "ordine": [
    {
      "sezione": "Food",
      "nome": "Pizza",
      "dettaglio": "",
      "quantita": 1
    },
    {
      "sezione": "Drinks",
      "nome": "Beer",
      "dettaglio": "33cl",
      "quantita": 2
    }
  ],
  "totale": 3
}
```

---

## Resulting Push Notification

```
🛎 Order from Mario
──────────────────
Name: Mario | 1x Pizza | 2x Beer 33cl
🕐 26/03/2026, 12:30:00
```

---

## Resulting Voice Announcement

```
Mario has ordered Pizza
```

---

## Customizing the TTS Message

Edit the `message` expression in the HA TTS node:

**Announce all items:**
```javascript
={{ $('Webhook').item.json.body.nome + ' has ordered ' + $('Webhook').item.json.body.ordine.map(i => i.quantita + ' ' + i.nome).join(', ') }}
```

**Announce total items:**
```javascript
={{ $('Webhook').item.json.body.nome + ' has ordered ' + $('Webhook').item.json.body.totale + ' items' }}
```

---

## Mobile App Setup (ntfy)

1. Install **ntfy** ([Android](https://play.google.com/store/apps/details?id=io.heckel.ntfy) / [iOS](https://apps.apple.com/app/ntfy/id1625396347))
2. **Settings → Manage servers → Add server**
   - URL: `https://ntfy.YOUR_DOMAIN.com`
   - Username: `admin`
   - Password: your admin password
3. **Subscribe to topic** → `YOUR_TOPIC_NAME`

> Set the credentials on the **server**, not the topic.
