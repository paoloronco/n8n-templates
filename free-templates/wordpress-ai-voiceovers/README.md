# WordPress Voiceovers — Google Cloud Text-to-Speech

Convert WordPress articles into Italian and English audio using n8n, Google Cloud Text-to-Speech, Translate, Cloud Run, and Google Sheets. This free template includes the workflow, a TTS service, deployment guidance, and sample audio.

![WordPress Voiceovers](assets/cover.png)

## How it works

1. Retrieve WordPress articles and track their processing status in Google Sheets.
2. Prepare the source text and translate it into English using Google Cloud Translate.
3. Generate long-form audio through the supplied Google Cloud Run TTS service.
4. Publish audio players to the configured WordPress pages, avoiding duplicates by post ID.
5. Update the processing status after both language branches finish.

## Included files

- [Importable n8n workflow](workflow/wordpress-google-cloud-voiceovers.json)
- [Cloud Run TTS service](service/main.py), [Dockerfile](service/Dockerfile), [requirements](service/requirements.txt), [environment example](service/.env.example) and [tests](service/test_main.py)
- [Installation and operations documentation](docs/00%20Home.md)
- [Audio samples](assets/samples/)

## Requirements

- An n8n instance with access to WordPress and Google Sheets
- WordPress REST API credentials and permission to update the target pages
- A Google Sheet with columns `ID`, `Title`, `Date`, `Content`, `Link`, `Status`
- A Google Cloud project with billing enabled and the required Cloud Run, Text-to-Speech, Translate, Cloud Storage, Cloud Build, and Artifact Registry APIs
- Appropriate Google Cloud credentials and a secured endpoint for the TTS service

**OpenAI is not required** for the current version. Google Cloud usage may incur charges even though the template is free.

## Setup

1. Follow the [requirements](docs/03%20Requirements.md) and [Google Cloud setup](docs/04%20Google%20Cloud%20Setup.md).
2. Deploy the service using the [TTS microservice guide](docs/05%20TTS%20Microservice.md).
3. Import the [workflow JSON](workflow/wordpress-google-cloud-voiceovers.json) into n8n.
4. Configure credentials, Google Sheet, WordPress pages, service endpoint, and all placeholders following the [n8n setup guide](docs/06%20n8n%20Setup.md).
5. Test one article manually, verify both audio outputs and WordPress players, then activate scheduling.

## Version notes

The current v1.3 documentation describes completion checks for long-running synthesis, synchronized language branches, idempotent WordPress players, and failure tracking. Review the [troubleshooting guide](docs/10%20Troubleshooting.md) before production deployment.

## Links

- [n8n Creator listing](https://n8n.io/workflows/11789-convert-wordpress-articles-to-multilingual-voiceovers-with-google-tts-and-openai/) (legacy listing; currently displays a paid price and outdated OpenAI requirements — updated free submission is under review)
- [Gumroad](https://paoloronco.gumroad.com/l/wordpress-voiceovers)
- [Project website](https://paoloronco.it)

For implementation assistance, contact [info@paoloronco.it](mailto:info@paoloronco.it).
