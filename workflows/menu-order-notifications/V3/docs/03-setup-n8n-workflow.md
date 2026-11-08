# 03 — Setup the n8n Workflow (V3)

[Full Notion documentation](https://paoloronco.notion.site/Documentation-Menu-Order-Push-Notifications-Home-Assistant-TTS-849f0ba27c32836e844101b86f496c55)

## 1. Import and authentication
Import [V3 JSON](../workflow/Online_Menu-Push_Notifications-Home_Assistant_TTS-BAC_Calculation-V3.json) as an inactive workflow. Configure the Webhook **Header Auth** credential and your frontend to send the matching header.

Configure ntfy HTTP Header Auth using `Authorization: Bearer YOUR_NTFY_TOKEN` and replace `http://ntfy/YOUR_TOPIC`. Use the same Docker network or a reachable HTTPS URL.

## 2. DataTables
| Table | Columns |
| --- | --- |
| Orders | `item` Text, `person` Text, `alcol_grammi` Number, `data` Text, `orario` Text |
| Claims | `sid` Text, `workflow` Text, `channel` Text, `state` Text |

Select the correct table in each DataTable node. Enforce unique `sid` claims if supported. The weekly cleanup clears Orders only; manage Claims retention separately.

## 3. TTS queue
Deploy a separate HTTP service that accepts authenticated `POST /announce` with a `message` body field, queues announcements and plays them via Home Assistant. Set its URL and `X-Menu-TTS-Secret` in **Queue TTS Announcement**. The service code is not bundled.

## 4. Example webhook payload
```json
{
  "orderId": "d4b47ef0-7410-4bc0-9d52-7f6152cbb702",
  "nome": "Mario",
  "orario": "12:30",
  "ordine": [
    {"nome": "Pizza", "quantita": 1, "alcol_grammi": 0},
    {"nome": "Birra bionda", "quantita": 2, "alcol_grammi": 13}
  ]
}
```

The same order must retain its UUID across retries. Missing IDs fall back to a per-execution identifier and do not provide retry deduplication.

## 5. Verification
1. Send a new order: expect HTTP **202**, order history, ntfy and queued TTS.
2. Retry the same UUID: expect **200 duplicate**, without repeated processing.
3. Verify a second order from the same customer updates daily history and the indicative BAC.
4. Confirm failed claim state returns **503** and retry later using the same ID.
5. Activate the workflow and use the production webhook URL.

**Important:** The BAC calculation is illustrative, not a clinical measurement or a driving-safety test. Accepted responses are sent before downstream delivery completes.
