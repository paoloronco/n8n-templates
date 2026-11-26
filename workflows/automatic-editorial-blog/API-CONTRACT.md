# Required editorial API contract

The workflow calls one authenticated POST endpoint with four actions. The backend owns database persistence, source acquisition, editorial rules, slot scheduling, budget reservation and accounting, deduplication, draft validation, review decisions, correction limits, CMS publication and reconciliation. These services must already exist or be implemented separately.

## claim

Input: `{ "action": "claim", "manualKey": "optional execution identifier" }`. Automated runs omit `manualKey`.

Return `{ "status": "claimed", "runId": "opaque durable ID", "writerRequest": { ... } }` when work is due. The existing IF checks `status === "claimed"`. Any other status follows No AI spend this run.

Reserve budget and acquire an idempotent slot before returning a claim. Keep topic and publication history in the backend. A manual key must not bypass quotas or create unlimited retries.

## AI request shape

`writerRequest` and `reviewRequest` use this text-only shape:

```json
{
  "model": "your-supported-model-id",
  "store": false,
  "service_tier": "default",
  "reasoning": { "effort": "low" },
  "input": [{ "role": "user", "content": "Your own instructions and source context" }],
  "max_output_tokens": 4000,
  "metadata": { "runId": "opaque durable ID" },
  "text": {
    "verbosity": "medium",
    "format": {
      "type": "json_schema",
      "name": "editorial_result",
      "strict": true,
      "schema": {
        "type": "object",
        "properties": { "title": { "type": "string" } },
        "required": ["title"],
        "additionalProperties": false
      }
    }
  }
}
```

The sample schema illustrates the request structure only. Supply the complete article and review schemas required by your backend, and choose parameters supported by the selected model. Supply exactly one text message or a plain input string. A single message containing text content parts is also mapped. Put all instructions in that message. Image, audio, file, multiple-message and tool input are outside this template's mapping. Validate all model output server-side. Never place authentication secrets in model metadata or prompt text.

## draft

Input: `{ "action": "draft", "runId": "...", "response": { "...": "full writer Responses API envelope" } }`.

Persist the raw response and actual usage, reject incomplete/refused/invalid output, validate references and schema, and return `{ "status": "drafted", "runId": "...", "reviewRequest": { ... } }` for an independent reviewer. Fail with a non-2xx response if validation cannot produce a review request. Draft writes must be idempotent.

## complete

Input: `{ "action": "complete", "runId": "...", "response": { "...": "full reviewer Responses API envelope" } }`.

Persist and validate the review before choosing a result:

- Approved: atomically publish once and return `{ "status": "published", "id": "article-id", "path": "/blog/article-slug", "verificationText": "a unique literal marker present in the public HTML" }`. `path` must be a leading-slash path on the configured origin. The marker must be article-specific and non-empty.
- One correction permitted: return `{ "status": "revision", "runId": "...", "writerRequest": { ... } }`. The writer is called again with this revised request. The original `runId` is retained by downstream nodes. Enforce the revision bound in the backend; the canvas loop itself does not count revisions.
- Final rejection: return another durable status such as `rejected`. The draft is kept for audit and the workflow does not publish it.

Publishing retries must return the same receipt rather than publish another article. Budget and review state must survive n8n restarts.

## fail

Input: `{ "action": "fail", "runId": "...", "stage": "writer|draft|reviewer|publication" }`.

Store an idempotent failure receipt. Preserve already consumed budget and any archived draft. Return a successful JSON acknowledgement only after persistence. The workflow then raises Stop with durable failure. Retry quotas and recovery policy belong to the backend.

## Public verification

The workflow performs a GET without following redirects. It requires HTTP 200 and the exact `verificationText` marker in the returned HTML. Verification failure occurs after publication: reconcile delivery using the durable receipt instead of generating another article. Ensure a server-rendered marker is available if the page uses client-side rendering.
