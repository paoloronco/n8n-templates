# Reliable Backup & Sync Execution Validation (Log-Driven)

## Quick Overview

Monitor backup and synchronization jobs through execution logs stored in Google Cloud Storage. This n8n workflow checks expected logs against a GitHub configuration, detects missing or failed runs, analyzes log contents with OpenAI, and sends Gmail alerts when attention is needed.

## How It Works

- Runs on a daily schedule after the configured log upload window.
- Lists log files in a date-based Google Cloud Storage (GCS) folder.
- Retrieves the expected job list from a GitHub-hosted `sync-jobs.json` file.
- Checks which required logs should exist based on their configured frequency and schedule.
- Sends a Gmail alert when an expected log is missing.
- Downloads available logs and checks execution markers, return codes, errors, and warnings.
- Supports structured rsync/rclone logs and the specific OneDrive text format recognized by the parser.
- Uses OpenAI to identify additional actionable issues in log contents.
- Sends separate Gmail notifications for execution failures and qualifying AI findings.

## Setup

- Import the workflow JSON into n8n and leave it inactive during configuration.
- Set your GCS bucket and hostname in `Set_Context`.
- Configure the bucket in both GCS nodes and connect your GCS credentials.
- Set your GitHub username, repository, and manifest path in `GitHub: sync-jobs.json`.
- Create or adapt `sync-jobs.json` to list the expected log filenames and schedules.
- Configure your backup scripts to generate compatible logs and upload them to the expected GCS folder.
- Connect Gmail credentials and replace the example recipient in all alert nodes.
- Connect OpenAI credentials and confirm the selected model is available.
- Review the schedule, timezone, and log upload cutoff for your environment.
- Test successful, missing, and failed logs before activating the workflow.

## Requirements

- An n8n instance with access to the required integrations.
- A Google Cloud Storage bucket containing uploaded backup/sync execution logs.
- A GitHub repository with a valid `sync-jobs.json` configuration file.
- Backup or sync jobs that generate logs in a format supported by the workflow.
- Google Cloud Storage, GitHub, Gmail, and OpenAI credentials.
- A configured log upload process that completes before the monitoring schedule.

## Customization

- Change the GCS bucket, hostname, log folder structure, and monitoring schedule.
- Add or remove monitored jobs in `sync-jobs.json`.
- Configure daily, weekly, or monthly expectations according to the workflow's scheduling rules.
- Adapt the log parser to additional backup tools or log formats.
- Adjust the deterministic checks and AI notification thresholds.
- Customize email recipients, subjects, and notification content.
- Use any backup destination supported by your backup tool; GCS is used here to collect the execution logs.

## Additional Info

This workflow **monitors backup and sync executions; it does not run the backup jobs**. The included configuration expects logs in GCS and uses Gmail for notifications, including AI findings. The GitHub manifest and the log naming convention must match your environment. Weekly and monthly checks follow the workflow's implemented scheduling assumptions rather than a general-purpose cron interpreter.

**[Complete Setup Guide & Technical Documentation](https://paoloronco.notion.site/Documentation-Reliable-Backup-Sync-Execution-Validation-Log-Driven-403f0ba27c3280179a84fb206e06481a)**


### Project Links

- n8n Creators: [View template](https://n8n.io/workflows/12880-monitor-backup-and-sync-logs-with-google-cloud-storage-github-gmail-openai-and-glpi/)
- Gumroad: [View product](https://paoloronco.gumroad.com/l/ReliableBackup-SyncExecutionValidation)

### Professional Services & Consulting

For professional consulting, tailored solutions, or collaboration opportunities, feel free to get in touch.

**Email:** info@paoloronco.it  
**Website:** https://paoloronco.it
