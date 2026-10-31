#!/usr/bin/env bash
set -euo pipefail
: "${BUCKET:?Set BUCKET to your GCS bucket name}"
LOGDIR="${LOGDIR:-/var/log/sync-jobs}"
HOST="${HOST:-$(hostname -s)}"
GCS_REMOTE="${GCS_REMOTE:-gcs}"
DATE_UTC="$(date -u +%Y/%m/%d)"
rclone copy "$LOGDIR" "${GCS_REMOTE}:${BUCKET}/sync-logs/${HOST}/${DATE_UTC}/" --include '*.log'
