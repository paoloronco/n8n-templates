# n8n — Menu Order Push Notifications + Home Assistant TTS

> Extension of template **5 — Menu Order Push Notifications**: adds a **Home Assistant TTS voice announcement** on every new order, in addition to the ntfy push notification.

---

## Overview

When a customer submits an order on your menu website:

1. n8n receives the order via webhook
2. A **push notification** is sent to your phone via ntfy.sh
3. A **voice announcement** is triggered on your Google Home (or any Google Cast device) via Home Assistant TTS

**No cloud TTS fees. No external services beyond HA + Google Home. Fully self-hosted.**

---

## Architecture

```
Menu Website
     │
     │  POST /webhook/menu
     ▼
┌─────────────┐
│  n8n        │
│  Webhook    │
└──────┬──────┘
       │
       ▼
┌─────────────┐       ┌──────────────────────┐
│  ntfy.sh    │──────▶│  📱 Mobile App       │
│  (Docker)   │  push │  ntfy (Android/iOS)  │
└──────┬──────┘       └──────────────────────┘
       │
       ▼
┌─────────────┐
│  n8n DB     │
│  (log)      │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  Home Assistant     │
│  Call Script        │
│  annuncia_ordine    │
└──────────┬──────────┘
           │  tts.speak
           ▼
┌─────────────────────┐
│  Google Home        │
│  (Google Cast)      │
│  🔊 "Mario has      │
│   ordered pizza"    │
└─────────────────────┘
```

---

## Example Notification + Announcement

**Phone notification (ntfy):**
```
🛎 Order from Mario
──────────────────
Name: Mario | 1x Pizza | 2x Beer 33cl
🕐 26/03/2026, 12:30:00
```

**Google Home voice announcement:**
```
Mario has ordered Pizza
```

---

## Stack

| Component | Role |
|---|---|
| **n8n** | Workflow automation — receives orders, dispatches notifications and TTS |
| **ntfy.sh** | Self-hosted push notification server |
| **Home Assistant** | Orchestrates TTS via the `annuncia_ordine` script |
| **Google Home** | Plays TTS audio via Google Cast |
| **Docker** | Runs ntfy (and optionally n8n) |
| **Cloudflare Tunnel** | Exposes ntfy over HTTPS (no open ports) |
| **ntfy mobile app** | Receives push notifications on Android/iOS |

---

## Prerequisites

- A running **n8n** instance
- **Home Assistant** running on your local network (e.g. `homeassistant.local:8123`)
- At least one **Google Home** (or Chromecast-capable) device paired in HA via Google Cast
- **Docker** available on the same host as n8n (for self-hosted ntfy)
- An Android or iOS device with the **ntfy app** installed

---

## Quick Start

### 1. Setup Home Assistant TTS

Follow [docs/04-setup-homeassistant-tts.md](docs/04-setup-homeassistant-tts.md) to:

- Verify the Google Cast integration is active and your devices are visible in HA
- Create a **Long-lived access token** for n8n
- Create the `annuncia_ordine` script in HA
- Test the TTS manually from HA Developer Tools
- Create the **Home Assistant** credential in n8n

### 2. Setup ntfy (push notifications)

Follow [docs/01-setup-ntfy.md](docs/01-setup-ntfy.md) to:

- Add ntfy to your `docker-compose.yml`
- Configure `server.yml` with `auth-default-access: deny-all`
- Create an admin user and a dedicated n8n token

### 3. Expose ntfy over HTTPS

Follow [docs/02-setup-cloudflare-tunnel.md](docs/02-setup-cloudflare-tunnel.md) to expose ntfy on a public HTTPS URL (required for the mobile app).

### 4. Import and configure the n8n workflow

Follow [docs/03-setup-n8n-workflow.md](docs/03-setup-n8n-workflow.md) to:

- Import `workflow/menu-order-notifications-with-tts.json`
- Create the ntfy Header Auth credential
- Configure the ntfy node URL and topic
- Configure the Home Assistant node with your token
- Activate the workflow and copy the **Webhook Production URL**

### 5. Configure the menu website

Point your menu website's webhook to the n8n Production URL:

```js
// menu-data.js
"orderWebhook": "https://YOUR_N8N_DOMAIN/webhook/menu"
```

> See the [original template 5](../5-online_menu-push_notifications/README.md) for full website setup instructions and the `website-mockup/` files.

### 6. Test end-to-end

1. Place a test order from the menu website
2. Verify the push notification arrives on your phone
3. Verify the Google Home plays the voice announcement

---

## Setup Guides

- [01 - Setup ntfy.sh (Self-Hosted)](./docs/01-setup-ntfy.md)
- [02 - Expose ntfy with Cloudflare Tunnel](./docs/02-setup-cloudflare-tunnel.md)
- [03 - Setup the n8n Workflow](./docs/03-setup-n8n-workflow.md)
- [04 - Setup Home Assistant TTS](./docs/04-setup-homeassistant-tts.md)

---

## File Structure

```
5a-online_menu-push_notifications-homeassistant-TTS/
├── README.md                                        ← you are here
├── workflow/
│   └── menu-order-notifications-with-tts.json      ← importable n8n workflow
└── docs/
    ├── 01-setup-ntfy.md                             ← deploy ntfy with Docker
    ├── 02-setup-cloudflare-tunnel.md                ← HTTPS exposure via Cloudflare
    ├── 03-setup-n8n-workflow.md                     ← workflow config + credentials
    └── 04-setup-homeassistant-tts.md                ← HA script + TTS setup
```

---

## Webhook Payload

Your website should POST this JSON to `https://YOUR_N8N_DOMAIN/webhook/menu`:

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

The TTS announcement uses `ordine[0].nome` — the first item in the order.

---

## Customization

| What | Where |
|---|---|
| Change the TTS message | Edit the `message` expression in the HA node inside n8n |
| Change the TTS language | Edit `language` in the `annuncia_ordine` HA script |
| Add multiple Google Home devices | Add more `media_player_entity_id` entries to the HA script |
| Announce all items (not just the first) | Use `$('Webhook').item.json.body.ordine.map(i => i.nome).join(', ')` |
| Disable TTS (keep only push) | Remove or deactivate the HA node in the n8n workflow |

---

## Security Notes

| Layer | Mechanism |
|---|---|
| Transport (ntfy) | HTTPS via Cloudflare Tunnel |
| ntfy access | `auth-default-access: deny-all` |
| n8n → ntfy | Dedicated Bearer token |
| n8n → Home Assistant | Long-lived access token (HA profile page) |
| Mobile app | Username/password on ntfy server |

---

## Related Resources

- [Full documentation on Notion](https://paoloronco.notion.site/Documentation-Menu-Order-Push-Notifications-Home-Assistant-TTS-32ff0ba27c328073a168ff501c9cf33a)
- [Template 5 — Push Notifications only](../5-online_menu-push_notifications/README.md)
- [ntfy.sh documentation](https://docs.ntfy.sh)
- [Home Assistant TTS documentation](https://www.home-assistant.io/integrations/tts/)
- [Home Assistant Scripts](https://www.home-assistant.io/integrations/script/)
- [Google Cast integration](https://www.home-assistant.io/integrations/cast/)
- [n8n Home Assistant node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.homeassistant/)

---

## License

MIT — free to use, modify, and share.
