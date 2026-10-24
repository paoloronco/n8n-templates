# WordPress VoiceOvers v1.3

Generate Italian and English audio from WordPress posts with n8n and Google Cloud.

## Safe quick start

1. Read 03 Requirements and create the Google Sheet with columns ID, Title, Date, Content, Link, Status.
2. Complete 04 Google Cloud Setup.
3. Deploy and test the service with 05 TTS Microservice.
4. Import the workflow and replace every placeholder using 06 n8n Setup.
5. Run one post manually and follow 08 Usage & Operations.
6. Activate the schedule only after both WordPress pages and both WAV files are correct.

## Guarantees in v1.3

- The service returns completed only after Long Audio Synthesis finishes.
- Merge waits for both language branches before writing done.
- A stable HTML marker prevents a second player for the same Post ID and language.
- Technical text is retained; only HTML and repeated whitespace are normalized.
- Handled branch errors become failed: reason in the queue.

## Navigation

01 Overview · 02 Architecture · 03 Requirements · 04 Google Cloud Setup · 05 TTS Microservice · 06 n8n Setup · 07 Node Reference · 08 Usage & Operations · 09 Customization · 10 Troubleshooting · 11 FAQ
