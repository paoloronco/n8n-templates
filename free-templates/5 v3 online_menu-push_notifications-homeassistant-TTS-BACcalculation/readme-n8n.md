# n8n Template — Publishing Info

## Title

> **Receive restaurant order push and voice alerts with n8n, ntfy and Home Assistant**

80 chars. Extension of: *"Receive instant restaurant order notifications with n8n webhooks and ntfy"*

---

## Template Description

*(paste this in the n8n template description field)*

---

Every time a customer places an order on your menu website, this workflow does two things at once: sends a **push notification to your phone** via ntfy.sh and triggers a **voice announcement on your Google Home** via Home Assistant TTS.

No third-party notification APIs. No cloud TTS fees. Fully self-hosted.

**How it works:**

1. Your menu website sends a POST request to the n8n Webhook node when a customer places an order
2. n8n forwards the order details to a self-hosted ntfy.sh instance → your phone receives a push notification via the ntfy app
3. The order is logged to the n8n DB table
4. n8n calls a Home Assistant script (`annuncia_ordine`) via the Home Assistant node → the script triggers `tts.speak` on a Google Home device (Google Cast), announcing the customer name and item ordered

**What you need:**

- A self-hosted n8n instance reachable from the public internet
- A self-hosted ntfy.sh instance (Docker) on the same network as n8n
- Home Assistant running on your local network with the Google Cast integration configured
- At least one Google Home (or Chromecast-capable) device visible in Home Assistant
- A domain for ntfy (Cloudflare Tunnel recommended — no open ports required)
- The ntfy app installed on Android or iOS

**What to configure after importing:**

1. Create a **Header Auth** credential for ntfy (`Bearer YOUR_NTFY_TOKEN`) and set it on the `ntfy notification` node — update the URL to point to your topic
2. Create a **Home Assistant** credential (host + Long-lived access token) and set it on the `Home Assistant TTS` node
3. In the `Home Assistant TTS` node, add a Service Attribute: `message` = `={{ $('Webhook').item.json.body.nome }} has ordered {{ $('Webhook').item.json.body.ordine[0].nome }}`
4. In Home Assistant, create a script named `annuncia_ordine` that calls `tts.speak` with `{{ message }}` on your Google Home entity
5. Activate the workflow and set the Webhook Production URL as the order endpoint in your menu website

**Full setup guide:**
https://paoloronco.notion.site/Documentation-Menu-Order-Push-Notifications-Home-Assistant-TTS-32ff0ba27c328073a168ff501c9cf33a

---

## Tags / Categories (suggested)

- Automation
- Notifications
- Home Assistant
- IoT
- Restaurant / Food & Beverage
- ntfy
- Self-hosted

---

## Credentials required

| Credential | Used by |
|---|---|
| Header Auth | ntfy notification node |
| Home Assistant | Home Assistant TTS node |

---

## Nodes used

| Node | Role |
|---|---|
| Webhook | Receives order from the menu website |
| HTTP Request | Sends push notification to ntfy |
| Home Assistant | Calls `script.annuncia_ordine` in HA |
| Data Table (n8n DB) | Logs the order |
