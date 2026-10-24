# 03 — GCS Log Bucket & Uploader

[← Main guide](../GUIDE.md) · [← Scripts](02-backup-scripts.md) · [Next →](04-github-manifest.md)

Create a private bucket in Google Cloud Storage with uniform bucket-level access. Use a limited writer identity for log uploads and read/list permissions for n8n. Do not publish service-account keys.

## Configure rclone
```bash
rclone config
rclone lsd gcs:YOUR_GCS_LOG_BUCKET
```

Create a GCS remote named `gcs`. Then use [upload-logs-to-gcs.sh](../scripts/upload-logs-to-gcs.sh):

```bash
BUCKET=YOUR_GCS_LOG_BUCKET HOST=YOUR_HOSTNAME LOGDIR=/var/log/sync-jobs bash scripts/upload-logs-to-gcs.sh
```

Uploads go to `gcs:YOUR_GCS_LOG_BUCKET/sync-logs/YOUR_HOSTNAME/YYYY/MM/DD/`, using **UTC upload date**. Ensure the n8n `Set_Prefix` value matches.

Schedule log upload **after the backup completes** and before n8n runs. Avoid copying partially written logs.
