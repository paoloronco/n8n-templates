# 04 — GitHub Job Manifest

[← Main guide](../GUIDE.md) · [← GCS](03-gcs-upload.md) · [Next →](05-n8n-setup.md)

Copy [sync-jobs.example.json](../config/sync-jobs.example.json) to `/sync-jobs.json` in a repository readable by n8n.

```json
{"schema":"sync-monitor/v1","jobs":[{"id":"documents","log_file":"OracleCloud_Documents-rsync.log","required":true,"frequency":"daily","cron_time":"02:00"}]}
```

| Field | Meaning |
| --- | --- |
| `id` | Job identifier |
| `log_file` | Exact GCS object basename |
| `required` | Whether the log is expected |
| `frequency` | daily, weekly or monthly |
| `cron_time` | Job's scheduled local HH:mm |
| `cron_days` | Weekly days: 0=Sunday through 6=Saturday |

V2 also accepts provider-specific arrays ending `_jobs` and `log_file_prefix` for monthly filenames. Monthly logic assumes day-1 runs with a short grace window; it is not a general cron interpreter.
