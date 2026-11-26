# Setup & Configuration

> Prepare the outside services, import the workflow and connect its credentials before the first staging run.

[Automatic Editorial Blog](../README.md)

## What you need before you start

You need an n8n workspace that can import workflows, run Code nodes and use the OpenAI node version 2. You need an OpenAI account with API billing and access to a model compatible with the request fields your backend supplies.

You also need a working editorial API and a blog or CMS that it can publish to. The API owns topic selection, source material, prompts, persistent state, budget reservations, draft validation and publishing. Importing the workflow does not install that service.

Prepare the editorial backend before attempting the publishing path.

## Setup roadmap

1. Set up OpenAI and confirm model access.
2. Set up the editorial API and its public article verification.
3. Create credentials in n8n.
4. Configure the workflow's URLs, schedule and OpenAI nodes.
5. Read [How the Workflow Works](how-it-works.md), then complete [Testing & Validation](testing.md) before enabling scheduled execution.

## Import the workflow into n8n

1. Download `Automatic-Editorial-Blog.json` from the documentation home.
2. Sign in to your n8n workspace and open Workflows.
3. Use Import from File and choose the downloaded JSON.
4. Open the imported workflow.
5. Keep the workflow inactive while you complete the setup guides.
6. Confirm that both OpenAI nodes are recognized and the canvas connections are present.
7. Confirm that the writer and reviewer use the intended OpenAI account.

The file contains 17 functional nodes and 7 sticky notes. Its daily check is configured with cron `0 9 * * *` and the UTC timezone. The backend decides whether an article is due when that check runs.

## What is configured where

| Setting | Where to configure it |
| --- | --- |
| Editorial API endpoint | The four private HTTP Request nodes. |
| Public blog origin | Verify public article and Confirm live receipt. |
| OpenAI authentication | The two OpenAI nodes. |
| Editorial API authentication | Header Auth on the four private API nodes. |
| Model, prompts, article and review schemas | The backend's writerRequest and reviewRequest. |
| Topic history, budget and retry eligibility | Persistent state in the backend. |
| Recovery check time and timezone | Daily recovery check and workflow settings. |

## You are done when

- The workflow imports without missing-node errors.
- OpenAI and editorial API credentials are assigned to the intended nodes.
- The four private endpoint URLs and both public-origin references use your values.
- The backend implements claim, draft, complete and fail with durable state.
- Both AI request objects contain a supported model, a single text message and a complete JSON schema.
- The staging blog serves an article-specific verification marker in its HTML.
- The workflow is ready for a controlled manual staging run.

## Setup guides

Start with [Set up OpenAI](setup/openai.md), then prepare the editorial API, create credentials and configure the workflow. Continue with [How the Workflow Works](how-it-works.md) and [Testing & Validation](testing.md) after setup.

- [Set up OpenAI](setup/openai.md)

- [Set up the editorial API](setup/editorial-api.md)

- [Create credentials in n8n](setup/credentials.md)

- [Configure the workflow](setup/configure-workflow.md)
