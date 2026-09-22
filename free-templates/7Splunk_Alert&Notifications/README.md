# Splunk Alert Notifications — Email & Telegram

Receive Splunk alerts through an n8n webhook, normalize the alert payload, classify its severity, and automatically route notifications to **Email** and **Telegram**.

This template is designed as a lightweight notification layer between Splunk and your preferred communication channels. It is especially useful for security alerts such as failed SSH logins, brute-force attempts, suspicious authentication activity, or any other Splunk saved search that can trigger a webhook.

## How it works

```text
Splunk Alert
    │
    ▼
n8n Webhook
    │
    ▼
Normalize Splunk Alert Payload
    │
    ▼
Filter Valid Alerts
    │
    ▼
Severity routing
    ├── Critical / High ──► Urgent Email
    │                   └─► Telegram
    │
    └── Medium / Low / Informational ──► Standard Email
```

The workflow:

1. Receives an HTTP `POST` from Splunk on the `/splunk-notification` webhook.
2. Normalizes different Splunk payload formats into a predictable structure.
3. Discards invalid alerts.
4. Normalizes severity values such as `crit`, `severe`, `warning`, and `info`.
5. Calculates a fallback severity when Splunk does not provide one.
6. Sends **Critical** and **High** alerts through both Email and Telegram.
7. Sends **Medium**, **Low**, and **Informational** alerts through Email.

## Requirements

- n8n, self-hosted or n8n Cloud.
- Splunk with alerting/webhook support.
- An SMTP account for Email notifications.
- A Telegram bot and chat ID if you want Telegram notifications.
- Network connectivity from Splunk to the n8n webhook URL.

## Included nodes

| Node | Purpose |
| --- | --- |
| **When Splunk Notification Received** | Receives the Splunk webhook request. |
| **Normalize Splunk Alert Payload** | Standardizes fields, severity, users, hosts, timestamps and event counts. |
| **Filter Valid Alerts** | Drops malformed alerts without a search name. |
| **If Severity Is Critical Or High** | Routes urgent alerts separately. |
| **Send Urgent Alert Email** | Sends HTML Email notifications for Critical/High alerts. |
| **Send Urgent Telegram Alert** | Sends Critical/High alerts to Telegram. |
| **Send Standard Alert Email** | Sends Email notifications for lower-severity alerts. |

## Import the workflow

1. Download the workflow JSON from this directory.
2. Open n8n.
3. Select **Import from File**.
4. Import the JSON workflow.
5. Configure the credentials and values described below.
6. Activate the workflow only after completing a test.

## n8n configuration

### 1. Webhook

The workflow exposes:

```text
POST /splunk-notification
```

Open the **When Splunk Notification Received** node and copy its **Production URL**.

It will normally look similar to:

```text
https://n8n.example.com/webhook/splunk-notification
```

Use the Production URL in Splunk, not the temporary test webhook URL.

### 2. Email

Configure SMTP credentials on both Email nodes:

- `Send Urgent Alert Email`
- `Send Standard Alert Email`

Then replace:

```text
alerts@yourdomain.com
you@example.com
```

with your sender and destination addresses.

### 3. Telegram

Create or select Telegram Bot credentials in the **Send Urgent Telegram Alert** node.

Replace:

```text
YOUR_TELEGRAM_CHAT_ID
```

with the destination chat ID.

Telegram is used by default only for **Critical** and **High** severity alerts. You can change the routing if you want every Splunk alert to reach Telegram.

## Splunk configuration

Create a Splunk saved search or alert for the event you want to monitor.

A common security example is failed SSH authentication:

```spl
index=* ("authentication failure" OR "Failed password")
| stats count AS failed_attempts
        values(user) AS targeted_users
        values(host) AS targeted_hosts
        earliest(_time) AS first_seen
        latest(_time) AS last_seen
        by src_ip
```

Adapt the search to your indexes, sourcetypes, field extractions, and use case.

Then:

1. Save the search as an alert.
2. Configure the alert trigger conditions in Splunk.
3. Add **Webhook** as an alert action.
4. Paste the n8n Production Webhook URL.
5. Trigger a test event.
6. Confirm that n8n receives and processes the request.

> Splunk searches differ between environments. The included workflow intentionally accepts multiple common field names so it is easier to reuse with different alerts.

## Supported payload fields

The normalization node looks for multiple equivalent field names.

### Alert metadata

| Normalized field | Accepted input examples |
| --- | --- |
| Alert ID | `sid` |
| Search name | `search_name`, `name` |
| App | `app` |
| Owner | `owner` |
| Results URL | `results_link` |
| Severity | `severity`, `urgency` |

### Security/event information

| Normalized field | Accepted input examples |
| --- | --- |
| Source IP | `src_ip`, `source_ip`, `src`, `rhost` |
| Failed attempts | `failed_attempts`, `count`, `event_count` |
| Targeted users | `targeted_users`, `user`, `users`, `target_user` |
| Targeted hosts | `targeted_hosts`, `host`, `hosts`, `dest_host` |
| First seen | `first_seen`, `earliest_time` |
| Last seen | `last_seen`, `latest_time` |

Multi-value users and hosts can be received either as arrays or as comma/newline-separated values.

## Severity handling

Supported normalized severities are:

- `critical`
- `high`
- `medium`
- `low`
- `informational`

The workflow also translates these aliases:

| Input | Normalized |
| --- | --- |
| `crit` | `critical` |
| `severe` | `critical` |
| `warning` | `medium` |
| `info` | `informational` |

### Automatic fallback severity

If Splunk does not send a supported severity, the workflow calculates one from `failed_attempts`:

| Failed attempts | Severity |
| ---: | --- |
| 20+ | Critical |
| 10–19 | High |
| 3–9 | Medium |
| 0–2 | Low |

To change these values, edit the **Normalize Splunk Alert Payload** Code node.

For example, if your alert should notify you even after one failed login, you can reduce the thresholds or make Splunk itself trigger after a single result.

## Example normalized event

After normalization, the workflow internally works with data similar to:

```json
{
  "search_name": "SSH Failed Login",
  "severity": "high",
  "severity_label": "HIGH",
  "src_ip": "10.10.0.236",
  "failed_attempts": 12,
  "targeted_users": ["paolo"],
  "targeted_hosts": ["security-server"],
  "first_seen": "2026-09-22T09:10:00",
  "last_seen": "2026-09-22T09:14:00"
}
```

The exact values depend on the Splunk search that generates the alert.

## Notification behavior

| Severity | Email | Telegram |
| --- | :---: | :---: |
| Critical | ✅ | ✅ |
| High | ✅ | ✅ |
| Medium | ✅ | — |
| Low | ✅ | — |
| Informational | ✅ | — |

Email notifications include the alert name, severity, source IP, failed-attempt count, targeted users and hosts, timestamps, alert owner, and a link back to Splunk when `results_link` is available.

## Testing

Before activating the workflow:

1. Keep the n8n workflow inactive while configuring credentials.
2. Run the webhook node in test mode if you want to inspect the incoming Splunk payload.
3. Generate a known event in Splunk.
4. Check the output of **Normalize Splunk Alert Payload**.
5. Verify that `search_name`, `severity`, `src_ip`, and `failed_attempts` contain the expected values.
6. Verify Email delivery.
7. For Critical/High events, verify Telegram delivery.
8. Switch Splunk to the n8n **Production URL**.
9. Activate the workflow.

## Customization ideas

This workflow can easily be extended with:

- Microsoft Teams or Slack notifications.
- Discord notifications.
- ServiceNow or Jira incident creation.
- Different routing for each severity.
- Alert suppression or deduplication.
- Rate limiting to avoid notification storms.
- Enrichment using threat-intelligence APIs.
- GeoIP enrichment for public source IPs.
- Automatic ticket creation only above a severity threshold.
- Different Telegram chats depending on the Splunk alert.

## Security notes

The webhook is an externally callable endpoint if your n8n instance is publicly reachable.

For production deployments, consider protecting it with one or more of:

- Reverse-proxy authentication.
- Cloudflare Access / Zero Trust.
- A secret header or token validated by n8n.
- IP allowlisting when the Splunk source has a stable address.
- HTTPS only.

Do not place SMTP credentials, Telegram tokens, or other secrets directly in the workflow JSON. Store secrets using n8n Credentials.

## Troubleshooting

### Splunk fires the alert but n8n receives nothing

Check:

- Splunk is using the **Production URL**.
- The n8n workflow is active.
- DNS and HTTPS are reachable from the Splunk server.
- Your reverse proxy/firewall allows the request.
- The configured webhook path is `/splunk-notification`.

### n8n receives the webhook but sends no notification

Inspect the normalized output and verify:

- `search_name` is not empty.
- Severity is one of the supported values.
- SMTP credentials are configured.
- Telegram credentials and chat ID are correct for urgent alerts.

### The severity is not what you expect

Splunk may not be sending a severity field. In that case, n8n uses the `failed_attempts` fallback thresholds.

Inspect the **Normalize Splunk Alert Payload** node and adapt its logic to your own Splunk search.

## License

This template follows the license of the parent **n8n-templates** repository.

## Author

Created and maintained by **Paolo Ronco**.

- GitHub: https://github.com/paoloronco
- Website: https://paoloronco.it
- n8n Creator profile: https://n8n.io/creators/paoloronco/
