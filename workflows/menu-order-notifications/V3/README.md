# Menu Order Notifications with ntfy, Home Assistant TTS and BAC Estimation

## Quick Overview
Receive menu orders through an authenticated n8n webhook, prevent duplicate processing, store daily order history, send ntfy notifications and queue Italian voice announcements. Includes a simplified cumulative alcohol estimate.

## How It Works
1. **Receive & normalize:** Parse the order, quantities, variants, alcohol metadata and Italian speech text.
2. **Deduplicate:** Claim a stable order UUID; return HTTP 202 for accepted orders, 200 for duplicates or 503 if claim state is unavailable.
3. **Announce:** Submit the spoken order to a separately deployed HTTP TTS queue.
4. **Record & notify:** Save the full order, read today's history for the same person, calculate an indicative BAC value and publish the ntfy message.
5. **Maintain:** Clear the order-history table every Monday at 04:00 (workflow timezone). The claims table is not cleared.

## Setup
1. Import [the workflow JSON](./workflow/Online_Menu-Push_Notifications-Home_Assistant_TTS-BAC_Calculation-V3.json) into n8n. It is distributed inactive.
2. Configure Webhook Header Auth and send a consistent v4 UUID `orderId` from the website.
3. Create two DataTables: **Orders** (`item`, `person`, `alcol_grammi`, `data`, `orario`) and **Claims** (`sid`, `workflow`, `channel`, `state`). Set the correct table IDs in the workflow and enforce unique claims for `sid` where supported.
4. Configure ntfy Header Auth and replace `http://ntfy/YOUR_TOPIC` with your endpoint.
5. Deploy a compatible, authenticated HTTP TTS queue; replace its URL and `X-Menu-TTS-Secret` placeholder. The queue service is **not included** in the workflow JSON.
6. Test a new order, retry the same `orderId`, verify history, notification and voice playback; then activate.

## Requirements
- n8n with DataTables and an accessible authenticated webhook
- Menu frontend sending an order payload and stable UUIDs
- ntfy server, topic and publisher credentials
- A separate HTTP announcement queue and Home Assistant/TTS-capable speaker
- Two configured DataTables

## Customization
- Update drink pronunciation aliases in **Normalize Order & Speech**.
- Adjust notification text and the illustrative BAC constants (70 kg, 0.68) in **Calculate Cumulative BAC**.
- Modify the cleanup schedule and retention policy; claim records require separate retention management.
- Replace local service endpoints and authentication placeholders with your deployment values.

## Website Mockup

The [static website mockup](./website-mockup/) includes a customer-facing menu, browser-based admin editor and sample menu data. It is a demonstration frontend: see its README for V3 authentication, stable order IDs and security limitations.

## Documentation
- [Full setup guide (Notion)](https://paoloronco.notion.site/Documentation-Menu-Order-Push-Notifications-Home-Assistant-TTS-849f0ba27c32836e844101b86f496c55)
- [n8n Creators listing](https://n8n.io/workflows/14487-notify-on-menu-orders-via-ntfy-and-home-assistant-tts-with-daily-bac-tracking/)
- [Gumroad](https://paoloronco.gumroad.com/l/n8n-menuwebsite-ordernotifications)

## Additional Info
The BAC value is a simplified estimate based on configured alcohol grams, without time-based elimination or individual physiology. **Never use it for driving, medical or legal decisions.** The webhook acknowledges an accepted order before all downstream notifications complete; HTTP 202 does not guarantee successful delivery. Rotate any secret that appeared in earlier exports.
