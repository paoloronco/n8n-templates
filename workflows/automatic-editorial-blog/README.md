# Automatic Editorial Blog

[Workflow JSON](Automatic-Editorial-Blog.json) · [Full Notion documentation](https://paoloronco.notion.site/Automatic-Editorial-Blog-Native-OpenAI-424f0ba27c3281828db5f28abc20a6e3) · [Editorial API contract](API-CONTRACT.md)

## Quick overview

Write, review and publish sourced articles using OpenAI nodes and a compatible editorial API. Reserve editorial work before generation, archive the draft and review, allow one correction and verify the published article.

A compatible editorial backend is required. It owns topics, sources, prompts, budget, durable state and CMS publication. This package supplies the n8n workflow and setup guides; implement or connect the backend described in [API-CONTRACT.md](API-CONTRACT.md) before running the publishing path.

## How it works

1. **Start:** Check for due work on a daily schedule or request one slot manually.
2. **Claim:** The backend atomically reserves the topic, slot and budget and returns a writer request.
3. **Write:** OpenAI generates structured article content; the backend archives and validates the draft.
4. **Review:** A separate OpenAI call reviews the draft against the backend's source context and rules.
5. **Decide:** The backend publishes once, supplies one corrected writer request or keeps a rejected draft for audit.
6. **Verify:** The workflow checks the article's public HTTP response and article-specific HTML marker.
7. **Recover:** Supported failures are recorded against the same durable run ID before the execution stops.

The backend controls article cadence. A daily check does not necessarily generate an article. See [How the Workflow Works](docs/how-it-works.md) for every branch and failure path.

## Setup

1. **Prepare the backend:** Implement the four authenticated actions in [API-CONTRACT.md](API-CONTRACT.md) and connect a staging CMS or blog. The backend must store reservations, usage, drafts, reviews, correction counts and publication receipts.
2. **Import:** Download [Automatic-Editorial-Blog.json](Automatic-Editorial-Blog.json), import it into n8n and keep the workflow inactive during setup.
3. **Connect OpenAI:** Assign the intended OpenAI credential to **Write sourced article** and **Independent editorial review**.
4. **Connect the editorial API:** Assign Header Auth and replace `https://example.com/api/editorial` in **Claim budget and original topic**, **Archive and validate draft**, **Publish approved article atomically** and **Record failed run without regeneration**.
5. **Set the public origin:** Replace `https://example.com` in **Verify public article** and **Confirm live receipt**. The backend must return a leading-slash article path and a non-empty `verificationText` present in the returned HTML.
6. **Configure requests:** Supply complete `writerRequest` and `reviewRequest` objects from the backend. Keep **Simplify Output** off, **Reasoning Summary** set to none and the downstream response-normalization expressions intact.
7. **Choose the schedule:** Review `0 9 * * *` and the UTC workflow timezone. Keep backend budget and correction limits effective for manual runs as well.
8. **Validate:** Follow [Testing & Validation](docs/testing.md) against staging before activating production triggers. A manual execution can publish when the backend approves an article.

Follow [Setup & Configuration](docs/setup.md) for the service-by-service instructions.

## Requirements

- n8n with OpenAI node version 2, Code and HTTP Request nodes.
- OpenAI API access for the selected model and structured output.
- An authenticated editorial API implementing `claim`, `draft`, `complete` and `fail`.
- Persistent backend storage, budget accounting, idempotent publication and a CMS publishing adapter.
- A public article page returning HTTP 200 and its article-specific verification marker without redirects.

The workflow accepts a plain input string or exactly one text message per AI request. Supply your complete article and review schemas; the example schema in the contract only illustrates the request format.

## Customization

- **Editorial behavior:** Set topics, source selection, writer instructions and independent review rules in the backend.
- **Models and schemas:** Adjust model IDs, token allowances, reasoning effort and JSON schemas through the two request objects.
- **Automation:** Change the recovery cron and timezone; enforce budgets, attempt limits and one correction in durable backend state.
- **Delivery:** Adapt the CMS connector while preserving publication receipts, idempotency and the public-verification contract.

See [Customization & Advanced Usage](docs/customization.md) before changing the request mapping.

## Documentation

| Guide | Purpose |
| --- | --- |
| [Setup & Configuration](docs/setup.md) | Import the workflow and prepare each service. |
| [OpenAI setup](docs/setup/openai.md) | API project, model access and usage accounting. |
| [Editorial API setup](docs/setup/editorial-api.md) | Backend actions, schemas and publishing responsibilities. |
| [Credentials](docs/setup/credentials.md) | OpenAI and Header Auth connections. |
| [Workflow configuration](docs/setup/configure-workflow.md) | URLs, schedule, request mapping and runtime settings. |
| [How the Workflow Works](docs/how-it-works.md) | Claim, writing, review, correction, publishing and failure paths. |
| [Testing & Validation](docs/testing.md) | Controlled staging checks and expected results. |
| [Operations & Troubleshooting](docs/operations.md) | Diagnose failures and reconcile existing publications. |
| [Customization & Advanced Usage](docs/customization.md) | Change editorial rules, models, schemas and services. |
| [API contract](API-CONTRACT.md) | Concise request and response reference. |

## Operating notes

- The workflow includes 17 functional nodes and 7 sticky notes; all individual nodes are enabled and the workflow is inactive for configuration.
- The workflow timeout is 600 seconds. Private editorial requests retry up to three times, so each backend action must be idempotent.
- The backend enforces correction limits; the canvas loop does not count corrections.
- Public verification can fail after publication. Reconcile the existing article and receipt before generating another one.
- Model calls and publishing depend on your configured services. The staging guide describes checks to perform against your deployment.

## Support and customization

For implementation help, contact [info@paoloronco.it](mailto:info@paoloronco.it) or visit [paoloronco.it](https://paoloronco.it/).
