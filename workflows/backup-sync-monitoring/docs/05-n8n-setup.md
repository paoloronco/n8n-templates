# 05 — n8n Node-by-Node Setup

[← Main guide](../GUIDE.md) · [← GitHub](04-github-manifest.md) · [Next →](06-alerts-ai.md)

Import [Backup_Sync_V2.json](../workflow/Backup_Sync_V2.json) and keep it inactive during setup.

| Node | Configure |
| --- | --- |
| `Set_Context` | Host and bucket placeholders |
| `Set_Prefix` | Confirm `sync-logs/<host>/YYYY/MM/DD/` |
| `Get a list of objects` | GCS bucket and credentials |
| `Bucket _ Download Log` | GCS bucket and credentials |
| `GitHub: sync-jobs.json` | Owner, repository, `/sync-jobs.json`, credentials |
| Three `Gmail:` alert nodes | Recipient and Gmail credentials |
| `AI Log Analyzer` | OpenAI credentials and available model |
| `Schedule Trigger` | Monitoring time and timezone |

**Both GCS nodes have independent bucket fields:** changing `Set_Context.bucket` does not change them automatically.

The GCS path uses UTC date. Presence-check logic uses Europe/Rome and an 08:10 upload cutoff. Review overnight jobs and DST. Test with multiple logs before activation.
