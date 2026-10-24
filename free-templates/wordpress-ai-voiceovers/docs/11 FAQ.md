# 11 · FAQ

## Does it need OpenAI?

No. v1.3 removed both OpenAI calls. HTML removal and whitespace normalization are deterministic and retain technical content.

## Why two WordPress pages?

They act as language-specific audio indexes. You may replace them with another publishing design, but keep one stable idempotency key per Post ID and language.

## Is done reliable?

It means both TTS requests completed and both WordPress update nodes succeeded in that execution. It does not independently probe the public object URL after synthesis.

## Are retries safe?

WordPress retries are idempotent. Translate and ordinary API reads retry. TTS does not automatically retry because a timed-out Google operation may still complete and incur cost.

## Is Cloud Run private?

The portable setup is publicly reachable but requires a mandatory application API key and strict instance concurrency. IAM plus OIDC is stronger and documented in 05; its token-minting step depends on the n8n hosting environment.

## Why can a row remain processing forever?

There is no processing state in v1.3. Rows are empty, done or failed. Concurrent executions are still unsupported because Sheets does not provide an atomic queue lock.

## Does an EU bucket guarantee EU TTS processing?

No. LOCATION defaults to global. If residency matters, configure a currently supported regional value such as eu, verify Long Audio and voice availability, and review Google’s current data-location documentation.
