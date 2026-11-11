# Smart Menu Order Automation — Real-Time Alerts, Voice Announcements & BAC Tracking (V4)

> **Staging candidate — not production-ready.** This release is shared for evaluation and integration testing. The published JSON intentionally removes all five unfiltered DataTable Delete nodes and disconnects the weekly cleanup and legacy setup triggers. Do not enable production traffic before completing the validation checklist.

## Quick Overview

Automate menu orders with authenticated webhooks, ntfy push alerts, Italian Home Assistant TTS announcements, n8n DataTables, indicative BAC tracking, error fallbacks and daily reporting.

## How It Works

1. **Order intake:** An authenticated `POST /menu` webhook validates a UUID v4 `orderId`, customer details, items and quantities.
2. **Duplicate protection:** DataTable claims record order IDs and processing states. Existing IDs are recognized, but concurrent requests are **not transactionally deduplicated**.
3. **History and BAC:** Saves structured orders and estimates cumulative alcohol levels using an indicative time-adjusted Widmark model.
4. **Notifications:** Sends the order through ntfy and submits Italian voice text to a separately deployed HTTP TTS queue.
5. **Failure handling:** Consolidates delivery results, tracks errors and sends Telegram/email fallback alerts.
6. **Daily reports:** Summarizes previous-day orders, customers, popular products and alcohol totals at 00:10 (Europe/Rome).

## Setup

1. Import [the V4 workflow JSON](./workflow/Smart_Menu_Order_Automation_V4_STAGING.json) into n8n. It is distributed **inactive**.
2. Configure the **Webhook Header Auth**, **ntfy Header Auth**, **TTS queue Header Auth**, **Telegram Bot**, and **SMTP** credentials. Credentials are intentionally not bundled in the public export.
3. Create or select the two required n8n DataTables and bind their IDs in all DataTable nodes:
   - **`menu paoloronco intranet`**: `order_id`, `customer_id`, `person`, `item`, `items_json`, `data`, `orario` (text); `alcol_grammi` (number).
   - **`Notification SID Claims`**: `sid`, `claim_token`, `order_id`, `customer_id`, `workflow`, `channel`, `state`, `error_detail`, `updated_at` (text).
4. Replace the instance-specific **ntfy topic**, **TTS endpoint**, notification addresses, and other environment values. The example TTS service is **not included**; it must implement `POST /announce` and enforce idempotency keys.
5. Set `MENU_FALLBACK_TELEGRAM_CHAT_ID` in n8n variables. Verify timezone `Europe/Rome` and test valid orders, duplicates, outages and notification delivery before activation.
6. **Do not re-enable the cleanup or auto-setup branches.** They are disconnected, and all destructive Delete nodes have been removed from this public staging export.

### Example Payload

```json
{
  "orderId": "d4b47ef0-7410-4bc0-9d52-7f6152cbb702",
  "customerId": "mario-01",
  "nome": "Mario",
  "orario": "12:30",
  "ordine": [
    { "nome": "Pizza", "quantita": 1, "alcol_grammi": 0 },
    { "nome": "Birra bionda", "quantita": 2, "alcol_grammi": 13 }
  ]
}
```

Use the **same** `orderId` for retries of one order.

## Requirements

- n8n with built-in DataTables support and an authenticated webhook
- Menu frontend capable of sending JSON orders with stable UUID v4 IDs
- Authenticated ntfy server/topic and subscriber devices
- Home Assistant, Italian TTS and a **separate** authenticated HTTP announcement queue
- Telegram bot and SMTP credentials for fallback alerts
- Two DataTables with the columns listed above

## Customization

- **Notifications:** ntfy topic, message formatting, TTS pronunciation aliases and language.
- **BAC:** alcohol grams per product and illustrative calculation parameters.
- **Customers:** customer ID mapping, names, product variants and item quantities.
- **Fallbacks:** Telegram destination, SMTP sender/recipient and diagnostic text.
- **Reports:** product rankings, customer statistics and daily reporting schedule.
- **Retention:** `MENU_RETENTION_DAYS` is referenced in the inactive maintenance code, but **automatic deletion is not available in this staging export**.

## Documentation

- [Full setup, architecture and troubleshooting — Notion](https://paoloronco.notion.site/Documentation-Menu-Order-Push-Notifications-Home-Assistant-TTS-849f0ba27c32836e844101b86f496c55)
- [Shared ntfy setup](../docs/01-setup-ntfy.md)
- [Shared Cloudflare Tunnel setup](../docs/02-setup-cloudflare-tunnel.md)
- [Previous V3 release](../V3/README.md)

## Consulting & Support

Need help deploying, securing or customizing the workflow? [Request a consultation](https://paoloronco.it/) or email [info@paoloronco.it](mailto:info@paoloronco.it).

## Additional Info — Production Validation

- **Deduplication:** DataTable read/insert/verify is best-effort; strict concurrency safety requires a transactional unique-key store.
- **TTS:** The queue must enforce receiver-side idempotency; a timeout can mean the announcement was accepted but its response was lost.
- **Error recovery:** Accepted orders may fail after HTTP 202. Manual reconciliation is required for stale pending/review states.
- **Retention:** All five unfiltered Delete nodes have been **removed**, including the reachable concurrent-claim deletion. Automatic cleanup is intentionally disabled.
- **Portability:** Bind DataTables, credentials and service endpoints to your environment. The legacy one-click DataTables setup does not create missing tables.
- **BAC:** Informational estimate only; **never use it for driving, medical or legal decisions**.

**Status:** V4 Staging Candidate · Inactive · Not production-certified.
