# Tech & AI News Intelligence

## Quick overview

Collect news from cybersecurity, AI, and technology RSS feeds, rank and group related stories, and deliver a curated English-language email briefing. OpenAI handles selection and summaries, Gemini provides an AI fallback, and a deterministic fallback keeps the digest available when both fail.

## How it works

1. **Collect:** A daily schedule or manual trigger starts the RSS readers. Their results are combined into one stream.
2. **Filter:** Keep recently published articles, validate links and dates, and normalize article metadata.
3. **Rank and group:** Assign heuristic relevance scores, cluster stories with similar headlines, and exclude events recorded in the delivery history.
4. **Select and summarize:** OpenAI selects up to 10 stories and writes short English summaries. Invalid or unavailable output is routed to Gemini, then to a deterministic fallback if necessary.
5. **Validate and render:** Check AI-selected article IDs and summary fields against the collected input, then build a responsive HTML newsletter with source links and a dynamic subject line.
6. **Deliver and record:** Read subscriber addresses from Google Sheets, send via SMTP, and store delivered event keys and a basic execution report in n8n workflow static data.

## Setup

1. **Import the workflow JSON** into n8n.
2. **Configure the AI providers:** Select your OpenAI credentials in `OpenAI Chat Model - Primary` and Gemini credentials in `LLM - News Summarizer`.
3. **Connect Google Sheets:** In `Get News Subscribers`, select your own spreadsheet and worksheet. Add a header named `Subscriber_email`, with one email address per row.
4. **Configure SMTP:** In `MailGun Send_News`, select your SMTP credentials and set an authorized `fromEmail` address. Mailgun is the original provider, but another compatible SMTP service may be used.
5. **Review the RSS sources:** Disable, remove, or replace feeds that are unavailable or irrelevant. Check that all remaining sources are connected to `Merge_All`.
6. **Set the schedule:** Adjust `Schedule Trigger` (configured for 07:30) and confirm your n8n workflow timezone.
7. **Test safely:** Use a spreadsheet with **one test recipient** and run `Manual Trigger`. Inspect `Rank Cluster and Check History`, both AI validation paths, the generated HTML, and the delivery result before enabling scheduled runs.

> **Important:** Replace the spreadsheet selection and sender address included in the exported workflow. Verify all imported credential selections before execution. A manual run can send real emails.

## Requirements

- A running n8n instance with the nodes used in the imported workflow, including a Merge node supporting multiple inputs.
- OpenAI API credentials and access to the configured chat model.
- Google Gemini API credentials and access to the configured Gemini model.
- Google Sheets access, with a `Subscriber_email` column.
- SMTP credentials and an authorized sender address.
- Outbound access to the configured RSS feeds and API endpoints.

API usage and email delivery may incur provider charges.

## Customization

- **Sources:** Edit the RSS Read nodes and update the corresponding inputs to `Merge_All`.
- **Topics and editorial criteria:** Adjust the OpenAI and Gemini prompts, plus the ranking logic in `Rank Cluster and Check History`.
- **Number of stories:** Update the AI selection limits and matching validation rules together; the current configuration targets up to 10 stories.
- **Newsletter design:** Edit `Build Final Newsletter HTML` to change the layout, typography, colors, subject, and footer.
- **Delivery:** Change the Google Sheets worksheet, SMTP sender, recipient list, or schedule.
- **History:** Adjust the 30-day retention logic in `Rank Cluster and Check History` if a different repeat-prevention window is needed.

## Links

- [Repository overview](../../README.md)
- [Original deployment guide](https://paoloronco.it/n8n-template-rss-tech-news-to-your-inbox/) (may describe an earlier version)
- [n8n Creator profile](https://n8n.io/creators/paoloronco/)

## Additional info

- **Language:** The briefing and AI summaries are configured in English. Original RSS titles are retained, so an external source could still supply a non-English title.
- **Scoring and clustering:** These are heuristic methods, not fact-checking. Similar events may be missed or unrelated headlines may occasionally be grouped.
- **Source fidelity:** Summaries are based on the information available from RSS entries; readers should consult the linked articles for full context.
- **AI fallback:** If both providers fail validation, the workflow uses available article metadata to create a non-AI digest.
- **Persistent history:** The workflow uses n8n **workflow static data**, which is saved for active production executions, not reliably during manual testing. It is not a separate database or a full audit trail.
- **Delivery reporting:** The current report records a successful email item; it does **not** provide a consolidated delivery count or guarantee delivery to every subscriber. Review SMTP execution results for failures.
- **Testing:** The workflow JSON has been prepared for import, but integrations, feed availability, and delivery behavior depend on your n8n environment. Test end to end before production use.

This workflow uses public RSS content and links to original publishers. Respect each source's usage terms and your email recipients' consent and unsubscribe requirements.
