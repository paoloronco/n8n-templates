# Configure the workflow

> Replace service URLs, confirm the AI mapping and choose the recovery schedule in the imported workflow.

[Setup & Configuration](../setup.md)

## Before you start

Keep the workflow inactive. Use the staging endpoint and public origin prepared in Set up the editorial API, with credentials saved in n8n.

## Set the private editorial endpoint

Replace [https://example.com/api/editorial](https://example.com/api/editorial) with the same real endpoint in:

1. Claim budget and original topic
2. Archive and validate draft
3. Publish approved article atomically
4. Record failed run without regeneration

Keep POST, JSON request and response handling, and the intended Header Auth association.

The nodes' existing expressions provide claim, draft, complete and fail. Preserve the original claimed runId passed by draft, complete and fail.

## Set the public blog origin

In Verify public article, replace the example origin in the URL expression:

```javascript
={{ "https://your-blog.example" + $json.path }}
```

Replace that origin in the JavaScript of Confirm live receipt as well. The backend must return a leading-slash path on that same origin.

Keep redirect following disabled and keep the full HTTP response enabled so the receipt check can read statusCode and body.

## Confirm the OpenAI nodes

In Write sourced article and Independent editorial review, confirm:

- Resource: Text.
- Operation: Message a Model.
- Model: By ID, using writerRequest.model or reviewRequest.model.
- One explicit text message, mapped from the corresponding input.
- Simplify Output: off.
- Store, service tier, token limit, metadata, reasoning effort and JSON schema mapped from the request.
- Reasoning Summary: none.
- No additional built-in tools configured.

Configure the prompts and schemas in the backend. Follow Customization & Advanced Usage for the full field mapping.

## Preserve the API response expressions

Archive and validate draft and Publish approved article atomically must retain their normalization expressions. These convert parsed output\_text.text objects back to strings while keeping the full response and usage.

Editing only one of the two expressions can break the backend contract for either drafts or reviews.

## Set schedule and timezone

1. Open Daily recovery check.
2. Review cron 0 9 \* \* \*.
3. Open the workflow settings and choose the intended timezone.
4. Keep the workflow inactive until staging validation is complete.

The distributed timezone is UTC. The backend's claim action controls which publishing slots are eligible when the daily recovery check runs.

Use Run one editorial slot when starting a controlled manual test. Executing the daily-trigger path manually does not necessarily provide the same manualKey behavior.

## Review runtime and error settings

The workflow timeout is 600 seconds. Four private API requests use up to three attempts with 1,500 ms between attempts. Public verification uses up to three attempts with 2,000 ms between attempts.

Configure a global n8n error workflow if you need centralized failure notifications.

Keep budget, attempt and correction limits in the backend so they remain effective across manual runs and request retries.

## You are done when

The four private URLs, two public-origin references, six service credential associations, model mapping and timezone all match the intended staging deployment.

## Next step

Continue with [How the Workflow Works](../how-it-works.md), then follow [Testing & Validation](../testing.md).
