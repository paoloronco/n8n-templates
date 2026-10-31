# 07 — Tests & Troubleshooting

[← Main guide](../GUIDE.md) · [← Alerts](06-alerts-ai.md) · [Next →](08-cloud-providers.md)

| Test | Expected outcome |
| --- | --- |
| Complete log, rc=0, errors=0 | No deterministic error email |
| Expected log absent | Missing-log email |
| rc nonzero or errors present | Execution-error email |
| Missing START or END | Incomplete-execution alert |
| Empty GCS listing | Missing-log check; no undefined object download |
| Several logs | Each evaluated; no duplicate notifications |
| Synthetic AI finding | AI alert with severity and evidence |
| Invalid GitHub JSON | Visible workflow error |

**All logs missing:** Check bucket, host, prefix, UTC date and exact manifest filenames.

**GCS access denied:** Check permissions and credentials in both GCS nodes.

**GitHub failure:** Check owner, repo, path, authentication and JSON validity.

**False alerts:** Check upload timing, marker order, IF routing and execution history.

**AI failure:** Verify model availability, JSON output and credentials.

These are acceptance tests to perform on n8n; the bundled JSON has not been validated against live cloud integrations.
