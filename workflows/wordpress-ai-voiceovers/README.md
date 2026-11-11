# WordPress VoiceOvers
## Quick overview
This workflow converts recent WordPress posts into multilingual voiceovers using Google Cloud Text-to-Speech and Google Translate, managing job status and audio publishing through a Google Sheets queue.
## How it works
1. Triggered daily at 22:00 or manually to start the workflow.
2. Load configuration settings including languages, Google Sheets IDs, and Cloud Run URLs.
3. Fetch WordPress posts published within the configured lookback period.
4. Extract readable text and generate a content fingerprint for each post.
5. Read the current processing queue from Google Sheets.
6. Compare posts with the queue to identify new, changed, or failed jobs and update the queue accordingly.
7. Select pending and retryable jobs from the queue, respecting concurrency limits.
8. Acquire a run lock in the queue to prevent concurrent executions.
9. Loop over selected jobs, marking each as processing.
10. Fetch the current full article content for each job.
11. Build the speech text, generate deterministic audio filenames, and check if audio already exists.
12. If audio exists, skip generation; otherwise, translate text if needed and send TTS requests to the Cloud Run service.
13. Verify the generated audio file's existence and size.
14. Read the WordPress language page to update.
15. Build updated page content by inserting or replacing the voiceover player block.
16. Update the WordPress page with the new content.
17. Confirm the publication by verifying the saved content includes the audio player.
18. Mark the job as done in the queue.
19. Release the run lock after processing all jobs.
20. Reconcile article-level statuses based on job statuses and update the queue.
21. Collect and record any job failures for retry or reporting.
## Setup
1. Configure the `Workflow Configuration` node with your WordPress source language, Google Sheet ID, queue sheet name, Cloud Run TTS URL, Google Cloud Storage bucket name, and other parameters.
2. Enable and configure languages in the `languages` array with keys, language codes, voices, WordPress page IDs, and labels.
3. Create and prepare the Google Sheet with the specified ID and tab name, including the required header columns.
4. Ensure the Cloud Run TTS service and Google Cloud Storage bucket are set up and accessible.
5. Provide credentials for WordPress API and Google APIs (Sheets, Translate).
6. Verify that the WordPress API user has permissions to read posts and edit pages with unfiltered HTML.
7. Test the workflow manually using the `Manual Run` trigger before enabling the daily schedule.
## Requirements
- WordPress site with REST API access and appropriate permissions.
- Google Cloud project with enabled Sheets, Translate APIs, and Cloud Run TTS service.
- Google Sheets document prepared as a processing queue with correct headers.
- Cloud Storage bucket for storing generated audio files.
- Credentials for WordPress and Google APIs configured in n8n.
- Cloud Run TTS service URL and authentication configured.
## Customization
- Adjust `lookbackDays` to change how far back posts are scanned.
- Modify `maxJobsPerRun` and `maxAttempts` to control concurrency and retry behavior.
- Add or remove languages in the `languages` array, enabling or disabling them and setting page IDs.
- Customize filename patterns for audio files per language.
- Change labels and date locales for voiceover players.
- Update Cloud Run TTS URL and storage bucket names as needed.
- Modify translation chunk size and retry cooldown settings.

## Additional Details

This workflow requires configuration of Google Cloud Run and Storage for audio generation and hosting, as well as a Google Sheets queue to manage processing jobs. It supports multiple languages with customizable voice settings and handles retries and concurrency. For implementation help or customization, contact info@paoloronco.it or visit https://paoloronco.it.

Full technical documentation: https://app.notion.com/p/WordPress-VoiceOvers-415f0ba27c32816a960ac1a8a51dc5f9