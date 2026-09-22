# Tech & AI Daily Briefing — RSS to AI to Email

## Quick Overview

Aggregate technology, AI, cybersecurity, cloud, and digital-industry news from curated RSS feeds, filter and deduplicate recent stories, summarize them with a resilient AI pipeline, build an HTML newsletter, and email it automatically to subscribers.

![Workflow](Assets/workflow.png)

## How It Works

- **Scheduled or manual start** — The workflow runs from its Schedule Trigger and also exposes a webhook for on-demand testing or execution.
- **Multi-source RSS ingestion** — Dedicated RSS nodes collect stories from technology, cybersecurity, AI research, cloud, industry, and vendor sources before merging them into one stream.
- **Recency filtering** — Articles outside the configured recent-news window are removed before editorial processing.
- **Sorting and normalization** — Articles are ordered by publication date and normalized into a consistent structure containing title, content, link, date, and source.
- **Deduplication and balancing** — JavaScript removes near-duplicate stories and caps articles per source so one publisher does not dominate the briefing.
- **AI editorial processing** — OpenAI handles primary summarization and categorization, while a secondary LLM path is available when primary processing fails.
- **HTML generation** — A Code node validates structured output, handles unavailable or malformed model responses, and renders selected stories into a responsive HTML email.
- **Subscriber delivery** — Google Sheets supplies subscriber addresses, an IF node validates them, and SMTP sends the completed newsletter to valid recipients.

## Setup

- **Import the workflow** — Import `News_Tech_EN.json` into n8n.
- **Configure OpenAI** — Add OpenAI credentials to the primary chat model and review the selected model and editorial prompt.
- **Configure the fallback model** — Add credentials required by the secondary LLM path so processing can continue if the primary AI path fails.
- **Connect Google Sheets** — Configure the service account, select the subscriber spreadsheet, and ensure it contains the expected `Subscriber_email` column.
- **Configure SMTP** — Add SMTP credentials to the send node and replace the placeholder sender with a verified address.
- **Review triggers** — Adjust the schedule and webhook configuration to match your delivery and testing requirements.
- **Test before activation** — Send to a controlled test recipient, verify article selection and HTML rendering, then activate the workflow.

## Requirements

- n8n instance with the required core and AI nodes
- OpenAI API credentials
- Credentials for the configured fallback LLM
- Google Sheets document containing subscriber email addresses
- Google service account or compatible Google Sheets credentials
- SMTP account and verified sender address
- Network access to the configured RSS feeds

### Optional

- Public webhook access for on-demand execution
- Custom RSS feeds or additional source categories
- Alternative SMTP/email provider
- Modified AI models for different cost, latency, or quality requirements

## Customization

- **RSS sources** — Add, remove, or replace feeds to adapt the briefing to your preferred publications and topics.
- **Editorial categories** — Modify the AI prompt to change topic taxonomy, article limits, selection criteria, or summary language.
- **Recency window** — Change the filter to cover a different publication period.
- **Deduplication** — Tune title-similarity and per-source limits in the JavaScript preprocessing logic.
- **AI models** — Replace primary or fallback models while preserving the expected structured output.
- **Newsletter design** — Edit the HTML builder to change typography, layout, sections, branding, and subject formatting.
- **Distribution** — Replace Google Sheets subscriber storage or SMTP delivery with other n8n-supported services.

## Additional Info

- [Full deployment guide](https://paoloronco.it/n8n-template-rss-tech-news-to-your-inbox/)
- [n8n Community Template](https://n8n.io/workflows/11466-curate-and-send-tech-news-digests-with-rss-gemini-ai-and-gmail/)
- The workflow JSON is sanitized and does not include production API keys, account IDs, or subscriber addresses.
- RSS endpoints and publisher availability can change over time; review failing feed nodes when a source stops responding.
- AI-generated summaries should be treated as automated editorial output and may require validation for high-stakes use cases.
