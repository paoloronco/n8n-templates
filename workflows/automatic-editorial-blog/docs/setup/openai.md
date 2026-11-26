# Set up OpenAI

> Prepare the OpenAI account and model access used by the separate writer and reviewer calls.

[Setup & Configuration](../setup.md)

## What you need

Use the OpenAI account and API project intended for this publication. API access and billing are separate from editing a workflow in n8n.

The backend must choose a model compatible with the Responses API request it supplies, including the JSON schema, token allowance and reasoning options used by this template.

## Prepare API access

1. Sign in to [OpenAI Platform](https://platform.openai.com/).
2. Select the intended API project.
3. Confirm that API billing, usage limits and model access allow the planned calls.
4. Create or obtain the API key for that project.
5. Keep the key in your credential manager until you enter it in an n8n OpenAI credential. Do not put it in prompt text, Code nodes, metadata or this documentation.

## Choose writer and reviewer parameters

Configure the backend to return a complete writerRequest when a slot is claimed and a complete reviewRequest after the draft is validated.

Each request supplies:

- model
- one text input message or a plain text string
- max\_output\_tokens
- reasoning.effort
- a complete JSON output schema
- optional metadata and the supported storage/service settings.

The model can differ between writing and review if both satisfy the respective request contract. The review is a separate call with its own instructions and source context.

## Budget and usage

Allow for both writing and review, plus a possible single correction cycle. Use the actual usage returned in each response for accounting.

The backend must reserve budget before returning claimed and preserve consumption when a later step fails. Provider spending limits can provide an additional account-level control; the workflow's durable editorial budget still belongs in the backend.

## Verify access

After creating the n8n credential, perform controlled OpenAI calls with valid request objects in a staging or isolated test workflow. Confirm completion, structured output and usage before allowing the editorial publication path to run.

For authentication or quota errors, inspect the selected API project, key, billing access and model availability.

## You are done when

You have an API key for the intended project and a model choice compatible with both request schemas and reasoning settings. The key is stored as an n8n OpenAI credential, not in the exported workflow.

## Next step

Continue with [Set up the editorial API](editorial-api.md).
