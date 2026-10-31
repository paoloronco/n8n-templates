# 08 — Alternative Cloud Backup Destinations

[← Main guide](../GUIDE.md) · [← Testing](07-testing.md) · [Next →](09-release-notes.md)

The backup target is independent of the **GCS log store**.

| Backup destination | Tool | Example `DST` |
| --- | --- | --- |
| Hetzner Storage Box / SFTP | rclone | `hetzner:backups/documents` |
| Google Drive | rclone | `drive:backups/documents` |
| OneDrive | rclone | `onedrive:backups/documents` |
| S3 / compatible | rclone | `s3remote:bucket/documents` |
| GCS backup bucket | rclone | `gcs:backup-bucket/documents` |
| Linux server | rsync/SSH | `backup@host:/backups/documents/` |
| Mounted NAS | rsync | `/mnt/nas/backups/documents/` |

For rclone targets, configure and test the remote using `rclone config`. For rsync over SSH, configure keys and noninteractive access. Use the same structured log contract regardless of backup destination.

Other backup engines (restic, Borg, native cloud backup) require a log-format adapter or parser changes; native logs are not automatically supported.
