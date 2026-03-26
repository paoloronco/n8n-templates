# Menu Order Push Notifications + Home Assistant TTS + BAC

> Instant push notifications + cumulative BAC tracking + optional Home Assistant TTS — every time someone orders from the intranet menu website.

---

Receive instant push notifications on your phone **and** voice announcements on your Google Home every time someone orders — with cumulative **BAC tracking** per person. Powered by **n8n**, [**ntfy.sh**](http://ntfy.sh), **Home Assistant**, and n8n **DataTable**.

------

## Overview

This template extends [**template 5 — Menu Order Push Notifications**](https://github.com/paoloronco/n8n-templates/tree/main/free-templates/5-online_menu-push_notifications) with a **Home Assistant TTS voice announcement** triggered on every new order.

When a customer submits an order:

1. The website sends a `POST` request to an n8n webhook
2. n8n forwards the order to **ntfy** → push notification on your phone
3. n8n logs the order to the **DataTable**, reads all orders for that person today, and calculates the cumulative **BAC** (Widmark formula)
4. n8n calls a **Home Assistant script** → voice announcement on Google Home

**No cloud TTS fees. No external services beyond HA + Google Home. Fully self-hosted.**

------

## GitHub Repository

📂 **Folder:** [`free-templates/5a-online_menu-push_notifications-homeassistant-TTS`](https://github.com/paoloronco/n8n-templates/tree/main/free-templates/5a-online_menu-push_notifications-homeassistant-TTS)

📄 **Files included:**

- `workflow/menu-order-notifications-with-tts.json` — importable n8n workflow
- `docs/01-setup-ntfy.md` — deploy [ntfy.sh](http://ntfy.sh) with Docker
- `docs/02-setup-cloudflare-tunnel.md` — expose ntfy over HTTPS
- `docs/03-setup-n8n-workflow.md` — configure credentials and workflow
- `docs/04-setup-homeassistant-tts.md` — configure Home Assistant TTS

## Setup Guides

[01 - Setup ntfy.sh (Self-Hosted)](https://www.notion.so/01-Setup-ntfy-sh-Self-Hosted-32ff0ba27c32817a9a8ff3fb164a71cf?pvs=21)

[02 - Expose ntfy with Cloudflare Tunnel](https://www.notion.so/02-Expose-ntfy-with-Cloudflare-Tunnel-32ff0ba27c32810fb39ff691a5fed731?pvs=21)

[03 - Setup the n8n Workflow](https://www.notion.so/03-Setup-the-n8n-Workflow-32ff0ba27c3281348c35c795d2a7a634?pvs=21)

[04 - Setup Home Assistant TTS](https://www.notion.so/04-Setup-Home-Assistant-TTS-32ff0ba27c32814a8e11c4a8a5172c1f?pvs=21)

------

## Architecture

Webhook → Prepare Order → DataTable (INSERT) → Read Today (GET rows) → BAC Calculator → ntfy (push) → Home Assistant TTS (Google Home)

------

## Stack

| Component                     | Role                                                         |
| ----------------------------- | ------------------------------------------------------------ |
| **n8n**                       | Workflow automation — receives orders, calculates BAC, dispatches notifications and TTS |
| [**ntfy.sh**](http://ntfy.sh) | Self-hosted push notification server                         |
| **Home Assistant**            | Orchestrates TTS via the `annuncia_ordine` script            |
| **Google Home**               | Plays TTS audio via Google Cast                              |
| **Docker**                    | Runs ntfy alongside n8n on the same network                  |
| **Cloudflare Tunnel**         | Exposes ntfy to the internet over HTTPS (no open ports)      |
| **ntfy mobile app**           | Receives push notifications on Android/iOS                   |

------

## Prerequisites

- A running **n8n** instance reachable from the public internet
- **Home Assistant** on your local network (e.g. `homeassistant.local:8123`)
- At least one **Google Home** (or Chromecast-capable) device paired in HA via Google Cast
- **Docker** on the same host as n8n (for self-hosted ntfy)
- A domain or subdomain for ntfy (for HTTPS access from the mobile app)
- An Android or iOS device with the **ntfy app** installed

------

## DataTable Schema

Create a DataTable in **n8n → Data → Tables** with these columns:

| Column         | Type   | Description                                            |
| -------------- | ------ | ------------------------------------------------------ |
| `item`         | Text   | Full order string (e.g. "2x Negroni, 1x Messina 33cl") |
| `person`       | Text   | Normalised person name                                 |
| `alcol_grammi` | Number | Total grams of alcohol for this order                  |
| `data`         | Text   | ISO date (YYYY-MM-DD)                                  |
| `orario`       | Text   | Time string from the order                             |

------

## BAC Calculation (Widmark)

BAC [g/L] = total_alcohol_grams_today / (70 × 0.68)

Assumes ~70 kg body weight. Italian legal driving limit: **0.5 g/L**

| Emoji | Level      | BAC           |
| ----- | ---------- | ------------- |
| ⬜     | None       | 0 g/L         |
| 🟢     | Low        | < 0.2 g/L     |
| 🟡     | Warning    | 0.2 – 0.5 g/L |
| 🔴     | Over limit | > 0.5 g/L     |

The BAC is **cumulative per day per person**. Resets automatically the next day. To reset manually: delete rows from the DataTable.

------

## Setup Steps

### Step 1 — Setup Home Assistant TTS

Before configuring n8n, prepare the HA side:

1. Open Home Assistant at `http://homeassistant.local:8123`
2. Go to **Settings → Devices & Services → Integrations** — verify **Google Cast** is active and your devices are listed
3. Go to your HA profile → **Security → Long-lived access tokens** → **Create token** — copy it immediately (you'll use it in n8n)
4. Go to **Developer Tools → Actions**, set `Action: tts.speak`, select your TTS entity and Google Home entity, enter a test message — confirm the device speaks
5. Go to **Settings → Automations & Scenes → Scripts → + Add script → Edit in YAML** and paste:

```yaml
alias: annuncia_ordine
sequence:
  - action: tts.speak
    target:
      entity_id: tts.google_translate_en_com
    data:
      media_player_entity_id: media_player.YOUR_GOOGLE_HOME_ENTITY
      message: "{{ message }}"
      language: it
mode: single
```

> Replace `media_player.YOUR_GOOGLE_HOME_ENTITY` with your actual entity ID (e.g. `media_player.googlehome4105`).

See **docs/[04-setup-homeassistant-tts.md](http://04-setup-homeassistant-tts.md)** for the full step-by-step.

### Step 2 — Setup ntfy (self-hosted push notifications)

Deploy ntfy with Docker and configure authentication. Follow `docs/01-setup-ntfy.md`:

- Add ntfy to your `docker-compose.yml` on the same Docker network as n8n
- Set `auth-default-access: deny-all` in `server.yml`
- Create an admin user: `docker exec -e NTFY_PASSWORD="your_password" ntfy ntfy user add --role=admin admin`
- Generate the n8n token: `docker exec ntfy ntfy token add admin`

### Step 3 — Expose ntfy over HTTPS

The ntfy mobile app requires a public HTTPS URL to connect. Follow `docs/02-setup-cloudflare-tunnel.md` to add an ingress rule for ntfy in your Cloudflare Tunnel config:

```yaml
- hostname: ntfy.YOUR_DOMAIN.com
  service: <http://localhost:8095>
```

### Step 4 — Import and configure the n8n workflow

Follow `docs/03-setup-n8n-workflow.md`:

1. Create the **DataTable** (n8n → Data → Tables): columns `item` (Text), `person` (Text), `alcol_grammi` (Number), `data` (Text), `orario` (Text) — copy the DataTable ID
2. Import `workflow/menu-order-notifications-with-tts.json`
3. Create the **Header Auth** credential for ntfy:
   - **Name:** `HeaderAuth ntfy`
   - **Header Name:** `Authorization`
   - **Header Value:** `Bearer YOUR_NTFY_TOKEN`
4. Create the **Home Assistant** credential:
   - **Host:** `http://homeassistant.local:8123`
   - **Access Token:** your HA Long-lived token
5. Open the `ntfy notification` node → replace `YOUR_TOPIC` in the URL
6. Open the `Home Assistant TTS` node → set credential + add service attribute:
   - **Name:** `message`
   - **Value:** `={{ $('Webhook').item.json.body.nome }} has ordered {{ $('Webhook').item.json.body.ordine[0].nome }}`
7. Activate the workflow — copy the **Webhook Production URL**

### Step 5 — Configure the menu website

Set the webhook URL in your menu website:

```jsx
// menu-data.js
"orderWebhook": "https://YOUR_N8N_DOMAIN/webhook/menu"
```

Upload the website files to any static hosting (Nginx, Apache, GitHub Pages, Cloudflare Pages). See the [original template 5](https://github.com/paoloronco/n8n-templates/tree/main/free-templates/5-online_menu-push_notifications) for the full `website-mockup/` file descriptions and admin panel usage.

### Step 6 — Test end-to-end

- Install the **ntfy** app, add your ntfy server URL, log in with admin credentials, subscribe to your topic
- Place a test order from the menu website
- Verify the **push notification** arrives on your phone
- Verify the **Google Home** plays the voice announcement

------

## Example Output

**Push notification (ntfy):**

```jsx
🛎 Ordine da Mario

Mario: 1x Pizza, 2x Beer 33cl
🕐 12:30
📋 Già ordinato oggi (1 ordini):
  - 1x Prosecco  🕐 11:45
🍸 BAC ~0.54 g/L  🔴
```

**Google Home voice announcement:**

```jsx
Mario has ordered Pizza
```

------

## Webhook Payload

Your website must POST this JSON to the Webhook Production URL:

```json
{
  "nome": "Mario",
  "orario": "26/03/2026, 12:30:00",
  "ordine": [
    { "sezione": "Food", "nome": "Pizza", "dettaglio": "", "quantita": 1 },
    { "sezione": "Drinks", "nome": "Beer", "dettaglio": "33cl", "quantita": 2 }
  ],
  "totale": 3
}
```

The TTS announcement uses `ordine[0].nome` — the first item in the order.

------

## Customization

| What                                      | Where                                                        |
| ----------------------------------------- | ------------------------------------------------------------ |
| Change the TTS message                    | Edit the `message` expression in the HA TTS node in n8n      |
| Announce all ordered items                | Use `$('Webhook').item.json.body.ordine.map(i => i.quantita + ' ' + i.nome).join(', ')` |
| Change TTS language                       | Edit `language` in the `annuncia_ordine` HA script           |
| Announce on multiple Google Home devices  | Add multiple `media_player_entity_id` entries to the HA script |
| Disable TTS (keep only push notification) | Remove or deactivate the `Home Assistant TTS` node in n8n    |

------

## Resetting BAC

Delete rows from the DataTable. The next day the BAC automatically starts from zero (filter: `data = today`).

------

## Security Notes

| Layer                | Mechanism                                            |
| -------------------- | ---------------------------------------------------- |
| Transport (ntfy)     | HTTPS via Cloudflare Tunnel                          |
| ntfy access          | `auth-default-access: deny-all` — no anonymous reads |
| n8n → ntfy           | Dedicated Bearer token (no expiry, revokable)        |
| n8n → Home Assistant | Long-lived access token (HA profile page)            |
| Mobile app           | Username/password on the ntfy server                 |

------

## Related Resources

- [ntfy.sh](http://ntfy.sh) [documentation](https://docs.ntfy.sh)
- [Home Assistant TTS documentation](https://www.home-assistant.io/integrations/tts/)
- [Home Assistant Scripts](https://www.home-assistant.io/integrations/script/)
- [Google Cast integration](https://www.home-assistant.io/integrations/cast/)
- [n8n Home Assistant node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.homeassistant/)
- [ntfy Docker Hub](https://hub.docker.com/r/binwiederhier/ntfy)
- [Cloudflare Tunnel docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)
