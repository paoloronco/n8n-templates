#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# Ubuntu Server Sync Job Template (Oracle Cloud / rsync)
#
# PURPOSE
# -------
# Performs a one-way mirror sync using rsync and produces a deterministic,
# machine-parseable log file compatible with the monitoring workflow.
#
# DESIGN PRINCIPLES
# -----------------
# - One job = one log file
# - Deterministic log structure (START → RSYNC_END → SUMMARY → END)
# - No interactive input (safe for cron)
# - Explicit exit codes
#
# COMPATIBILITY
# -------------
# Fully compatible with the n8n GCS-based log monitoring workflow.
###############################################################################

########################
# USER CONFIGURATION
########################

# Logical job name (used in log filename and monitoring)
JOB="${JOB:-Projects}"

# Source directory (IMPORTANT: trailing slash matters for rsync)
SRC="${SRC:-/data/projects/}"

# Remote destination
DST="${DST:-backup@ORACLE_HOST:/backup/projects/}"

# Log directory (must be writable)
LOGDIR="${LOGDIR:-/root/sync-logs}"

# SSH configuration
SSH_KEY="${SSH_KEY:-/root/.ssh/id_ed25519_backup}"
SSH_OPTS="${SSH_OPTS:--i ${SSH_KEY} -o BatchMode=yes -o ConnectTimeout=10 -o ServerAliveInterval=30 -o ServerAliveCountMax=3}"

########################
# INTERNAL VARIABLES
########################

LOGFILE="${LOGDIR}/OracleCloud_${JOB}-rsync.log"
RUN_ID="$(date -u +'%Y%m%dT%H%M%SZ')-$$"
START_EPOCH="$(date +%s)"
HOST="$(hostname -s || hostname)"
RC=0
END_WRITTEN=0

mkdir -p "$LOGDIR"

########################
# HELPER FUNCTIONS
########################

ts_utc() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

log_kv() {
  echo "ts=$(ts_utc) host=${HOST} job=${JOB} run_id=${RUN_ID} $*" >> "$LOGFILE"
}

write_end() {
  [[ "$END_WRITTEN" -eq 1 ]] && return 0
  END_WRITTEN=1

  local end_epoch duration_s status
  end_epoch="$(date +%s)"
  duration_s=$(( end_epoch - START_EPOCH ))
  status="OK"
  [[ "$RC" -ne 0 ]] && status="FAILED"

  log_kv event=END rc="$RC" duration_s="$duration_s" status="$status"
}

on_exit() {
  local exit_rc=$?
  if [[ "$RC" -eq 0 && "$exit_rc" -ne 0 ]]; then
    RC="$exit_rc"
  fi
  write_end
}

trap on_exit EXIT
trap 'RC=130; exit 130' INT
trap 'RC=143; exit 143' TERM

########################
# START
########################

: > "$LOGFILE"
log_kv event=START src="$SRC" dst="$DST" msg="rsync job started"

########################
# RSYNC EXECUTION
########################

RSYNC_OPTS=(
  -aH
  --delete
  --stats
  --human-readable
  --partial
  --inplace
  --timeout=60
)

set +e
RSYNC_OUTPUT="$(rsync -e "ssh ${SSH_OPTS}" "${RSYNC_OPTS[@]}" "$SRC" "$DST" 2>&1 | tee -a "$LOGFILE")"
RC="${PIPESTATUS[0]}"
set -e

log_kv event=RSYNC_END rc="$RC" msg="rsync finished"

########################
# SUMMARY (PARSEABLE)
########################

ERROR_COUNT="$(grep -Eic '(failed|error|permission denied|no space left|connection reset)' <<<"$RSYNC_OUTPUT" || true)"
WARN_COUNT="$(grep -Eic '(warning|partial transfer|vanished)' <<<"$RSYNC_OUTPUT" || true)"

log_kv event=SUMMARY rc="$RC" errors="$ERROR_COUNT" warnings="$WARN_COUNT"

write_end
exit "$RC"
