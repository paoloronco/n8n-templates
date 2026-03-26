# n8n — Menu Order Push Notifications via ntfy.sh

> Receive instant push notifications on your phone every time a customer places an order on your menu website — powered by n8n and a self-hosted ntfy.sh instance.

---

## Overview

This template connects a **menu/ordering website** to your **smartphone** in real time.

When a customer submits an order, the website sends a `POST` request to an n8n webhook. n8n then forwards the order details to [ntfy.sh](https://ntfy.sh) (self-hosted), which delivers a push notification directly to the ntfy mobile app.

**No third-party notification APIs. No paid plans. Fully self-hosted.**

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
        │  POST http://ntfy/YOUR_TOPIC
        ▼
 ┌─────────────┐       ┌──────────────────────┐
 │  ntfy.sh    │──────▶│  📱 Mobile App       │
 │  (Docker)   │  push │  ntfy (Android/iOS)  │
 └─────────────┘       └──────────────────────┘
```

---

## Example Notification

```
🛎 Order from Mario
──────────────────
Name: Mario | 1x Messina 33cl | 2x Margherita Pizza
🕐 25/03/2026, 10:50:21
```

---

## Stack

| Component | Role |
|---|---|
| **n8n** | Workflow automation (webhook receiver + HTTP forwarder) |
| **ntfy.sh** | Self-hosted push notification server |
| **Docker** | Runs ntfy alongside n8n on the same network |
| **Cloudflare Tunnel** | Exposes ntfy to the internet over HTTPS (no open ports) |
| **ntfy mobile app** | Receives push notifications on Android/iOS |

---

## Prerequisites

- A running **n8n** instance reachable from the public internet
- **Docker** available on the same host (or network) as n8n if you want to self-host `ntfy`
- A domain or subdomain for `ntfy` if you want to expose a self-hosted instance over HTTPS
- An Android or iOS device with the **ntfy app** installed

---

## Quick Start

### 1. Choose ntfy cloud or self-hosted

You can use this template in two ways:
- **ntfy.sh cloud**: fastest option to get started. Point the HTTP Request node directly to `https://ntfy.sh/YOUR_TOPIC`
- **Self-hosted ntfy**: recommended if you want full control over privacy, authentication, users, and tokens

If you choose the self-hosted option, follow [docs/01-setup-ntfy.md](docs/01-setup-ntfy.md) to:
- Add ntfy to your `docker-compose.yml`
- Configure `server.yml` with `auth-default-access: deny-all`
- Create an admin user/password and a dedicated n8n token

### 2. If self-hosted, expose ntfy on a public HTTPS domain

If you use the self-hosted version, your phone must be able to reach `ntfy` from the internet through a public HTTPS URL.

You can do this in different ways:
- **Cloudflare Tunnel**: easiest no-open-port option
- **Reverse proxy + open port**: for example with Nginx or Caddy and TLS

If you want the Cloudflare approach, follow [docs/02-setup-cloudflare-tunnel.md](docs/02-setup-cloudflare-tunnel.md).

### 3. Import and configure the n8n workflow

Follow [docs/03-setup-n8n-workflow.md](docs/03-setup-n8n-workflow.md) to:
- Import `workflow/menu-order-notifications.json`
- Create the Header Auth credential with your ntfy token
- Update the HTTP Request node URL to point to your topic
- Activate the workflow and copy the **Webhook Production URL**

### 4. Configure and publish the menu website

The `website-mockup/` folder contains a **ready-to-host, multi-file website**:

| File | Role |
|---|---|
| `index.html` | Redirect to `menu.html` |
| `menu.html` | Customer-facing menu with cart and order form |
| `admin.html` | Password-protected admin panel (CRUD menu items, set webhook URL) |
| `menu-data.js` | Menu data loaded by both pages — edit this or use admin.html |

**To configure:**

1. Open `menu-data.js` and set `orderWebhook` to the **Webhook Production URL** copied from n8n:
   ```js
   "orderWebhook": "https://YOUR_N8N_DOMAIN/webhook/menu"
   ```
2. Set your restaurant name:
   ```js
   "title": "Your Restaurant Name"
   ```
3. Upload all 4 files to any static server (Apache, Nginx, GitHub Pages, Cloudflare Pages).
4. If you prefer, open `admin.html` and update the webhook URL from the admin panel instead of editing `menu-data.js` manually.

**To manage the menu without editing JSON**, open `admin.html` in a browser:
- Default password: `admin` (change it after first login)
- Add/edit/reorder sections and items
- "Salva menu" downloads an updated `menu-data.js` — upload it to your server

> The admin panel also lets you configure a second n8n webhook for **auto-updating `menu-data.js` on the server** on every save.

---

### 5. Connect your devices and test the flow

- Install the ntfy app on your phone or tablet
- Add your ntfy server URL
- Log in with the username/password created on the ntfy server
- Subscribe to the same topic used in the `ntfy notification` node
- Place a test order from the menu website and verify that the push notification arrives

If you already have your own website instead of using `website-mockup/`, send a `POST` request to `https://YOUR_N8N/webhook/menu` with this payload:

```json
{
  "nome": "Customer Name",
  "orario": "25/03/2026, 10:50:21",
  "ordine": [
    {
      "sezione": "Category",
      "nome": "Item Name",
      "dettaglio": "Variant/Size",
      "quantita": 2
    }
  ],
  "totale": 2
}
```

---

## Setup Guides

- [01 - Setup ntfy.sh (Self-Hosted)](./docs/01-setup-ntfy.md)
- [02 - Expose ntfy with Cloudflare Tunnel](./docs/02-setup-cloudflare-tunnel.md)
- [03 - Setup the n8n Workflow](./docs/03-setup-n8n-workflow.md)

---

## File Structure

```
github-version/
├── README.md                          ← you are here
├── workflow/
│   └── menu-order-notifications.json  ← importable n8n workflow
├── website-mockup/
│   ├── admin.html
│   ├── index.html
│   ├── menu-data.js
│   └── menu.html
└── docs/
    ├── 01-setup-ntfy.md               ← deploy ntfy with Docker
    ├── 02-setup-cloudflare-tunnel.md  ← HTTPS exposure via Cloudflare
    └── 03-setup-n8n-workflow.md       ← workflow config + credential setup
```

---

## Customization

- **Change notification format:** edit the `body` expression and `Title` header in the HTTP Request node
- **Multiple topics:** duplicate the HTTP Request node and point each to a different topic (e.g. by table, section, or staff member)
- **Different payload schema:** update the `$json.body.*` field names in the expressions to match your website's data structure
- **ntfy cloud instead of self-hosted:** replace `http://ntfy/YOUR_TOPIC` with `https://ntfy.sh/YOUR_TOPIC` and remove authentication (or use a paid ntfy.sh account for private topics)

---

## Security Notes

| Layer | Mechanism |
|---|---|
| Transport | HTTPS via Cloudflare Tunnel |
| ntfy access | `auth-default-access: deny-all` — no anonymous reads |
| n8n → ntfy | Dedicated Bearer token (no expiry, revokable) |
| Mobile app | Username/password on the ntfy server |

---

## Related Resources

- [ntfy.sh documentation](https://docs.ntfy.sh)
- [ntfy Docker Hub](https://hub.docker.com/r/binwiederhier/ntfy)
- [Cloudflare Tunnel docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)
- [n8n HTTP Request node docs](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/)

---

## License

MIT — free to use, modify, and share.
