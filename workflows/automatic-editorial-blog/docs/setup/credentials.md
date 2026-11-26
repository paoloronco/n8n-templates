# Create credentials in n8n

> Save the two service connections used by the workflow and assign them to the correct nodes.

[Setup & Configuration](../setup.md)

## Before you start

Obtain the OpenAI API key for the intended project and the header name and secret expected by your editorial API.

Credentials keep secret values outside workflow parameters and exported JSON.

## Create the OpenAI credential

1. Open Credentials in n8n.
2. Create an OpenAI API credential.
3. Enter the API key for the intended project and complete any account settings required by your deployment.
4. Save the credential.
5. Open Write sourced article and select that credential.
6. Open Independent editorial review and select the intended OpenAI credential.

Both nodes use OpenAI Message a Model with the Responses API. Model and output settings remain mapped from the backend request.

## Create Header Auth for the editorial API

1. Create a Header Auth credential in n8n.
2. Enter the exact header name expected by your backend.
3. Enter its matching secret header value.
4. Save the credential under a descriptive name.
5. Select Generic Credential Type → Header Auth in each of the four private HTTP Request nodes.
6. Assign the credential to all four nodes listed below.

| Node | Backend action |
| --- | --- |
| Claim budget and original topic | claim |
| Archive and validate draft | draft |
| Publish approved article atomically | complete |
| Record failed run without regeneration | fail |

The header name is defined by your backend. Do not assume that an example header name or an OpenAI bearer key is valid for the editorial service.

## Keep public verification unauthenticated

Verify public article reads the public article page without the private backend credential. Keep its target on the intended public blog origin.

## You are done when

Both AI nodes have the correct OpenAI connection, all four private API nodes use the intended Header Auth credential, and the public verification request has no private credential.

## Next step

Continue with [Configure the workflow](configure-workflow.md).
