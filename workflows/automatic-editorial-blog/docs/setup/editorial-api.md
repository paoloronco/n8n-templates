# Set up the editorial API

> Prepare the backend that owns editorial state and connects this n8n workflow to your blog or CMS.

[Setup & Configuration](../setup.md)

## Before you start

This page defines the required interface. The downloadable package does not include an implemented editorial backend or CMS adapter.

Use an HTTPS endpoint with authentication, persistent storage and permission to publish to a staging blog before connecting production.

## Responsibilities outside n8n

The backend must manage topics and coverage history, source acquisition, writer and review prompts, article schemas, slot scheduling, budget reservations and consumption, drafts, validation, review decisions, correction counts, publication and reconciliation.

Keep this journal durable across restarts. Repeated requests for the same claimed work must return the same effect and receipt.

## Endpoint and authentication

Use one authenticated POST endpoint for claim, draft, complete and fail. Configure the same URL in the four private HTTP Request nodes.

Choose the authentication header and value in the backend, then save them in a matching n8n Header Auth credential. Return JSON for successful responses. Use an appropriate HTTP error when a required operation or validation cannot be completed.

## Action 1: claim

Scheduled request:

```json
{"action":"claim"}
```

A manual run from Run one editorial slot also supplies a manualKey derived from the n8n execution ID. The key must not bypass quotas, attempt limits or existing slot ownership.

Before returning work, atomically reserve the slot and budget.

```json
{
  "status": "claimed",
  "runId": "durable-run-id",
  "writerRequest": {}
}
```

Replace the empty writerRequest shown here with the complete request described below. Other statuses follow No AI spend this run.

## AI request format

writerRequest and reviewRequest use the same technical shape, with prompts and schemas appropriate to their different roles.

```json
{
  "model": "configured-model-id",
  "store": false,
  "service_tier": "default",
  "reasoning": {"effort": "low"},
  "input": [
    {
      "role": "user",
      "content": "Your instructions, source context and requested task."
    }
  ],
  "max_output_tokens": 4000,
  "metadata": {"runId": "durable-run-id"},
  "text": {
    "verbosity": "medium",
    "format": {
      "type": "json_schema",
      "name": "editorial_result",
      "strict": true,
      "schema": {
        "type": "object",
        "properties": {
          "title": {"type": "string"}
        },
        "required": ["title"],
        "additionalProperties": false
      }
    }
  }
}
```

This is a request-format example. Replace the minimal title schema with the full article and review schemas required by your backend and CMS. Supply a model and parameter values supported by your API project.

The mapping accepts a plain input string or exactly one message. The message content can be a string or an array containing only input\_text parts.

Put all instructions in that content. A separate instructions field, multiple messages, images, audio, files and tools are outside this mapping. Never put authentication secrets in the input or metadata.

## Action 2: draft

```json
{
  "action": "draft",
  "runId": "durable-run-id",
  "response": {}
}
```

response is the full writer Responses API envelope. The workflow normalizes any parsed output\_text.text objects back into strings before sending it.

Persist the raw response and actual usage. Reject incomplete, refused, invalid or unsupported output, validate the complete article schema and source references, and prepare an independent reviewer request.

```json
{
  "status": "drafted",
  "runId": "durable-run-id",
  "reviewRequest": {}
}
```

The reviewRequest must be complete. The canvas goes directly from a successful draft HTTP request to the reviewer, so a validation failure must not return a successful response without a usable reviewRequest.

Draft writes must be idempotent for the claimed work.

## Action 3: complete

```json
{
  "action": "complete",
  "runId": "durable-run-id",
  "response": {}
}
```

Persist and validate the complete reviewer response before deciding what happens next.

### Approved

Publish atomically once and return:

```json
{
  "status": "published",
  "id": "article-id",
  "path": "/blog/article-slug",
  "verificationText": "an-article-specific-literal-marker"
}
```

path must begin with a slash on the configured public origin. verificationText must be non-empty and already present in the returned public HTML.

Repeated completion requests must return the same publication receipt, not another article.

### One correction allowed

Return revision, the same runId and a revised writerRequest. Preserve the original slot identity and count the correction durably.

The canvas loops to the writer but does not count revisions. Once the allowed correction has been consumed, return a final state instead of another revision.

### Final rejection

Return a durable final status such as rejected. The workflow keeps the draft for audit and ends without publication.

## Action 4: fail

```json
{
  "action": "fail",
  "runId": "durable-run-id",
  "stage": "writer"
}
```

stage can be writer, draft, reviewer or publication.

Store an idempotent failure receipt, preserve consumed budget and keep any archived draft. Acknowledge successfully only after the receipt is durable. The workflow then raises Stop with durable failure.

## Public article verification

The workflow makes an unauthenticated GET to the configured public origin plus path, without following redirects.

The final receipt requires HTTP 200 and an exact match for verificationText in the returned HTML. For client-rendered pages, expose the article-specific marker in the server response as well.

A verification failure can happen after publication. Reconcile the existing receipt and article instead of generating a replacement.

## Backend readiness checklist

- Slot and budget reservation happen before the claimed response.
- Topic history and source selection are persisted.
- Drafts and reviews are validated and stored with usage.
- All four actions are idempotent.
- One correction is enforced in durable state.
- A published receipt identifies one article and an HTML verification marker.
- Failures do not erase consumed budget or archived work.
- Recovery decisions survive backend and n8n restarts.

## You are done when

A staging endpoint implements all four actions and its blog serves an article page that satisfies public verification.

## Next step

Continue with [Create credentials in n8n](credentials.md).
