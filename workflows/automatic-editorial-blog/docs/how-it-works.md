# How the Workflow Works

> Follow one editorial slot from its budget reservation to its final publication receipt, using the actual node names.

[Automatic Editorial Blog](../README.md)

## Before you start

A run is one n8n execution. A slot is the backend's durable unit of editorial work. The `runId` identifies the claimed work across writing, review, correction and publication.

The workflow coordinates the process. The backend makes the editorial and storage decisions.

## Stage 1: Start and claim work

**Daily recovery check** starts the scheduled path. **Run one editorial slot** starts a manual path. Both lead to **Claim budget and original topic**.

The claim node sends `action: claim`. A manual execution also supplies `manualKey` based on the n8n execution ID. The backend must enforce the budget and attempt limit even for manual keys.

When work is due, the backend atomically reserves a slot and budget and returns `status: claimed`, `runId` and `writerRequest`.

## Stage 2: Decide whether to call AI

**An article is due** checks `status === "claimed"`.

If the result is false, **No AI spend this run** ends the workflow without entering either AI node. A daily check therefore does not mean an article is generated every day.

If the claim request itself fails, the execution stops before the writer.

## Stage 3: Write the article

**Write sourced article** uses the OpenAI **Message a Model** operation through the Responses API.

Its model, text input, token allowance, reasoning effort, metadata and output schema come from `writerRequest`. **Simplify Output** is off so the full response, including `status`, `output` and `usage`, remains available to the backend.

The input mapping accepts a string or exactly one text message. Image, audio, file and tool inputs require a different mapping.

## Stage 4: Archive and validate the draft

**Archive and validate draft** sends `action: draft`, the original `runId` and the complete writer response.

Before the request is sent, its expression converts any parsed `output_text.text` objects back into JSON strings. This preserves the response format expected by the backend.

The backend records usage, archives the raw result and validates the article. It must return a complete `reviewRequest` after successful validation. If it cannot do so, it must return an HTTP error: the canvas has no extra draft-status IF before the reviewer.

## Stage 5: Review independently

**Independent editorial review** sends `reviewRequest` through a second OpenAI node.

The backend supplies the review prompt, source context and review schema. This is a separate model call, not a continuation of the writer conversation.

The full review response is retained for the publication decision and usage accounting.

## Stage 6: Decide whether to publish

**Publish approved article atomically** normalizes the review response and sends `action: complete` with the same claimed `runId`.

The backend archives the review, validates its schema and chooses the next state:

| Backend state | Workflow result |
| --- | --- |
| published | Publication confirmed routes to public-page verification. |
| revision | One editorial revision needed routes back to the writer. |
| Any other durable final state, such as rejected | Keep rejected draft for audit ends without publishing. |

The backend is responsible for publishing exactly once and returning the same receipt when a completion request is repeated.

## Stage 7: Allow one bounded correction

A `revision` response must include a revised `writerRequest`. The loop writes and reviews the corrected article while downstream requests retain the original claimed `runId`.

The backend must enforce the correction limit. The canvas loop does not count revisions.

When no further correction is allowed, the backend must return a final rejection state rather than `revision`.

## Stage 8: Verify delivery

**Verify public article** requests the configured public origin plus the returned article `path`. Redirect following is disabled.

**Confirm live receipt** requires HTTP 200 and the exact, non-empty `verificationText` returned by the backend to appear in the HTML. It then returns the published URL and claimed `runId`.

A failure here can occur after the article has already been published. Reconcile the existing article instead of generating a replacement.

## Stage 9: Record failures

Errors from the writer, draft request, reviewer and complete request lead to:

**Prepare failure receipt → Record failed run without regeneration → Stop with durable failure**

The recorded stage is writer, draft, reviewer or publication. The backend keeps consumed budget and any archived draft before the workflow raises its final error.

Claim errors, failure-receipt errors and public-verification errors stop at their respective nodes.

## What is stored outside n8n

The backend must persist slot ownership, topic history, budget reservations and actual consumption, raw draft and review responses, validation decisions, revision counts, publication identifiers and failure receipts. n8n execution history supports diagnosis but does not replace this durable journal.

## Next step

Continue with [Testing & Validation](testing.md) and validate each outcome against a staging backend.
