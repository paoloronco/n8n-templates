# 01 — Architecture & Monitoring

[← Main guide](../GUIDE.md) · [Next →](02-backup-scripts.md)

The backup runs **outside n8n**. Its script writes a structured log, uploaded to GCS. GitHub defines expected filenames; n8n checks presence and execution status.

```mermaid
flowchart TD
 A["Linux backup job"] --> B["Backup destination"]
 A --> C["Local structured log"]
 C --> D["GCS uploader"]
 D --> E["GCS daily prefix"]
 F["GitHub manifest"] --> G["Presence check"]
 E --> G
 G --> H{"Log missing?"}
 H -->|Yes| I["Missing-log email"]
 E --> J["Download and parse"]
 J --> K{"Execution failed?"}
 K -->|Yes| L["Execution alert"]
 J --> M["Optional OpenAI"]
 M --> N["AI alert"]
```

| Component | Role |
| --- | --- |
| Backup script | Runs the backup and records outcome |
| GCS | Stores dated logs, not necessarily backup data |
| GitHub | Lists expected jobs and log filenames |
| Presence check | Detects absent expected log files |
| Parser | Checks lifecycle markers, return code, errors and warnings |
| AI | Reviews log text for additional anomalies |
| Gmail | Sends alerts |
