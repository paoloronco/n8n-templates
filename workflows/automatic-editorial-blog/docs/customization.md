# Customization & Advanced Usage

> Adapt the editorial behavior and output contract while preserving slot ownership, validation, budget accounting and delivery verification.

[Automatic Editorial Blog](../README.md)

## Before you start

Keep an unmodified copy of the distributed JSON. Make one change at a time and validate it with your staging backend.

Most editorial choices belong in the backend's writerRequest and reviewRequest rather than in fixed text inside n8n.

## Change topics, sources and editorial rules

Configure the backend's topic pool, coverage history, source selection and prompts. It should prepare a complete writer request for the claimed topic and an independent review request for the archived draft.

Supply the editorial rules and source material appropriate to your publication.

## Change the model and output schemas

The backend selects model, max\_output\_tokens, reasoning.effort, metadata and text.format. Choose values supported by the intended account and model.

Use full article and review schemas that match your storage and CMS. The minimal schema in the API setup guide is only a request-format example.

## OpenAI field mapping

| Backend request | OpenAI node field |
| --- | --- |
| model | Model, selected By ID through an expression. |
| input role and text | One explicit Messages entry. |
| store | Store; the template defaults to false. |
| service\_tier | Service Tier; defaults to default. |
| max\_output\_tokens | Maximum Number of Tokens. |
| metadata | JSON-serialized Metadata. |
| reasoning.effort | Reasoning → Effort. |
| `text.format.name`, schema and strict | Output Format → JSON Schema. |
| text.verbosity | Verbosity; defaults to medium. |

Keep Simplify Output off, set Reasoning Summary to none and leave built-in tools disabled.

All instructions must be in the input content. The mapping does not transfer a separate instructions field. Multiple messages, images, audio, files and tools need an explicit implementation change.

## Preserve response normalization

The OpenAI node can parse output\_text.text into an object even when Simplify Output is off. The draft and complete request expressions restore JSON strings while retaining the rest of the response:

```javascript
const response = JSON.parse(JSON.stringify($json));

for (const item of response.output ?? []) {
  if (item.type !== 'message') continue;
  for (const part of item.content ?? []) {
    if (part.type === 'output_text' && typeof part.text !== 'string') {
      part.text = JSON.stringify(part.text);
    }
  }
}
```

The distributed JSON contains the complete request expressions with action and the original claimed runId. Keep this behavior consistent in both downstream API nodes.

## Change the schedule

Daily recovery check uses `0 9 * * *`; the template timezone is UTC. Change the cron and workflow timezone together.

The backend's claim action determines article cadence and recovery eligibility. Increasing the n8n check frequency must not create more eligible slots or bypass the budget policy.

## Change the API or CMS

Update all four private API URLs and both public-origin references. Keep the action contract and response fields consistent with the workflow.

The publication response must return a leading-slash path and an article-specific verificationText in the server-returned HTML. A standard CMS endpoint generally needs an adapter implementing the editorial contract.

## Change budget and retry policy

Configure reservations, actual usage accounting, attempt limits and correction limits in durable backend state. The canvas alone does not enforce a monthly allowance or revision count.

The API nodes can retry up to three times, so repeated writes must resolve to the same underlying work.

## Next step

Repeat [Testing & Validation](testing.md) after changing prompts, schemas, services or runtime settings.
