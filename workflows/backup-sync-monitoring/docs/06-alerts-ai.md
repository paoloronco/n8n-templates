# 06 — Alerts & AI

[← Main guide](../GUIDE.md) · [← n8n](05-n8n-setup.md) · [Next →](07-testing.md)

| Node | Alert condition |
| --- | --- |
| `Gmail: Alert missing Logs` | Expected filename absent from GCS |
| `Gmail: Alert Error` | Deterministic parser reports failed or incomplete log |
| `Gmail: AI Alert Error` | AI finding satisfies notification policy |

The parser checks lifecycle markers, exit code, errors and warnings. `Code: Binary Text` converts logs to text; `AI Log Analyzer` requests JSON; `Code: Ticket?` evaluates severity/evidence. Despite the inherited name, **this V2 sends AI findings via Gmail, not GLPI**. GLPI requires separate authenticated API nodes.

AI processing transmits log text to the configured provider; review sensitive operational data and model costs.
