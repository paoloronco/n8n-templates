# Testing & Validation

> Validate the imported workflow in stages before enabling its schedule or pointing it at a production blog.

[Automatic Editorial Blog](../README.md)

## Before you start

Keep the workflow inactive and use a staging editorial API and staging blog. The manual trigger can reach the publication path when the backend approves an article; it is not a dry-run mode.

Use backend limits that permit only the intended test work. Record each returned `runId` so the draft, review, spending and publication receipts can be inspected together.

## Test 1: Check import and configuration

1. Open the imported workflow and confirm that all nodes are recognized.
2. Inspect both OpenAI nodes and the four private API nodes for credential associations.
3. Confirm that all four private URLs use the staging editorial endpoint.
4. Confirm that Verify public article and Confirm live receipt use the staging public origin.
5. Check the daily cron, workflow timezone and 600-second execution timeout.
6. Keep Simplify Output off in both AI nodes.

Expected result: the workflow is configured for the staging services and no execution has started.

## Test 2: No work due

1. Configure the staging backend so claim returns a non-claimed state.
2. Run **Run one editorial slot**.
3. Open **Claim budget and original topic** and inspect the response.
4. Confirm that **An article is due** follows its false output.
5. Confirm that **No AI spend this run** is the terminal path.

Expected result: neither OpenAI node runs and no article is published.

## Test 3: Write and review a controlled article

1. Allow the backend to claim one staging slot with valid source context.
2. Run the manual trigger and record its `runId`.
3. Inspect the output of **Write sourced article** for completion, structured content and usage.
4. Check that the backend has archived the draft and supplied reviewRequest.
5. Inspect the output of **Independent editorial review** and the stored review.

Expected result: the backend has one draft and one independent review for the same claimed work. A successful draft response always includes a usable reviewRequest.

## Test 4: Approval and public verification

1. Use a staging draft that the backend is allowed to approve.
2. Inspect the complete response for published, id, path and a non-empty verificationText.
3. Confirm that the staging CMS contains exactly one article for the slot.
4. Confirm that **Verify public article** returns HTTP 200 without a redirect.
5. Confirm that the HTML contains the exact marker and **Confirm live receipt** returns the staging article URL.

Expected result: the publication receipt and the public page identify the same article.

## Test 5: One correction and final rejection

1. Configure the backend to return revision once with a revised writerRequest.
2. Confirm that **One editorial revision needed** returns to the writer.
3. Confirm that the original claimed runId is still used by draft and complete.
4. Verify that the backend increments the durable revision count.
5. Once the allowed correction is consumed, return a final rejection instead of another revision.
6. Confirm that **Keep rejected draft for audit** ends the run without a publication.

Expected result: the correction is bounded by backend state, and rejected work remains available for audit.

## Test 6: Errors and repeated API requests

Test writer, draft, reviewer and complete failures separately using controlled staging inputs or backend responses.

Confirm that the failure receipt contains the original runId and correct stage. Confirm that the backend preserves consumed budget and any existing draft.

Repeat already processed draft, complete and fail requests against staging. The backend must reuse the existing records and receipt rather than add another article or reservation.

## Test 7: Publication exists but the public page fails

1. Publish a staging article and preserve its durable receipt.
2. Make the public endpoint return a redirect, unavailable page or missing verification marker.
3. Confirm that public verification fails.
4. Restore the existing page and verify that same article.
5. Confirm that no new writing or publication was required.

Expected result: delivery can be reconciled independently of generation.

## Read an execution in n8n

1. Open Executions and select the run.
2. Find the first failed node.
3. Read its input, response and error.
4. Match the runId with the backend journal.
5. Determine whether the slot was merely claimed, drafted, reviewed or already published before retrying.

## Verification checklist

A deployment is ready when no-work runs avoid AI, claimed runs preserve identity and usage, drafts are validated before review, correction limits are durable, repeated requests are idempotent, and the public receipt verifies the actual article.

## Enable the schedule after validation

Save the intended production URLs and credentials, confirm backend budget and revision limits, activate the workflow and monitor its first scheduled execution. Keep the staging receipts available for comparison.

## Next step

Use [Operations & Troubleshooting](operations.md) for diagnosis and recovery after deployment.
