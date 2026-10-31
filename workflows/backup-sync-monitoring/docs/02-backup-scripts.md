# 02 — Backup Scripts & Log Contract

[← Main guide](../GUIDE.md) · [← Architecture](01-architecture.md) · [Next →](03-gcs-upload.md)

## Choose a script
- [rsync_job-Template.sh](../scripts/rsync_job-Template.sh): rsync over SSH.
- [rclone_job-Template.sh](../scripts/rclone_job-Template.sh): sync to a configured rclone remote.

Set `JOB` (job name), `SRC` (source), `DST` (destination), `LOGDIR` (log directory), plus `SSH_KEY`/`SSH_OPTS` for rsync.

The original script names `OracleCloud_<JOB>-rsync.log` and `Hetzner_<JOB>-rclone.log` are labels, not provider restrictions.

## Required lifecycle
```text
event=START
event=RSYNC_END rc=0
event=SUMMARY rc=0 errors=0 warnings=0
event=END rc=0 duration_s=120 status=OK
```

For rclone use `RCLONE_END`. Actual lines include UTC timestamp, host, job and run ID. The manifest must match the exact log filename.

To use an existing backup engine, preserve its command, capture the real exit code and emit these markers; otherwise adapt the parser. Native logs are not automatically compatible.

The templates use mirror semantics (`rsync --delete` and `rclone sync`), which can remove destination-only files. Check your retention/versioning requirements.
