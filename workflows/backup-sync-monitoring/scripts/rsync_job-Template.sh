#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# Ubuntu Server Sync Job Template (Hetzner / rclone)
#
# PURPOSE
# -------
# Mirrors a local directory to a remote rclone backend (e.g. Hetzner Storage Box)
# and produces a deterministic log file for monitoring.
###############################################################################

########################
# USER CONFIGURATION
########################

JOB="${JOB:-Projects}"
SRC="${SRC:-/data/projects/}"
DST="${DST:-hetzner-sftp:backups/projects}"
LOGDIR="${LOGDIR:-/root/sync-logs}"

########################
# INTERNAL VARIABLES
########################

LOGFILE="${LOGDIR}/Hetzner_${JOB}-rclone.log"
RUN_ID="$(date -u +'%Y%m%dT%H%M%SZ')-$$"
START_EPOCH="$(date +%s)"
HOST="$(hostname -s || hostname)"
RC=0
END_WRITTEN=0

mkdir -p "$LOGDIR"

########################
# HELPERS
########################

ts_utc() { date -u +"%Y-%m-%dT%H:%M:%SZ"; }
log_kv() { echo "ts=$(ts_utc) host=${HOST} job=${JOB} run_id=${RUN_ID} $*" >> "$LOGFILE"; }

write_end() {
  [[ "$END_WRITTEN" -eq 1 ]] && return
  END_WRITTEN=1

  local duration status
  duration=$(( $(date +%s) - START_EPOCH ))
  status="OK"
  [[ "$RC" -ne 0 ]] && status="FAILED"

  log_kv event=END rc="$RC" duration_s="$duration" status="$status"
}

trap write_end EXIT

########################
# START
########################

: > "$LOGFILE"
log_kv event=START src="$SRC" dst="$DST" msg="rclone sync started"

########################
# RCLONE
########################

set +e
rclone sync "$SRC" "$DST" \
  --fast-list \
  --transfers 8 \
  --checkers 16 \
  --stats 30s \
  --stats-one-line \
  --log-level NOTICE \
  2>&1 | tee -a "$LOGFILE"
RC="${PIPESTATUS[0]}"
set -e

log_kv event=RCLONE_END rc="$RC"

ERROR_COUNT="$(grep -Eic '(ERROR|Failed|permission denied|no space left)' "$LOGFILE" || true)"
WARN_COUNT="$(grep -Eic '(WARNING|retry|skipped)' "$LOGFILE" || true)"

log_kv event=SUMMARY rc="$RC" errors="$ERROR_COUNT" warnings="$WARN_COUNT"

exit "$RC"
