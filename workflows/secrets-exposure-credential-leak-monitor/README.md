# Secrets Exposure & Credential Leak Monitor

Monitor a GitHub repository for possible credential exposure, track unique findings in Notion, and send a redacted email digest. The V4 workflow uses bounded, serial GitHub requests and durable n8n Data Tables to resume scans and recover delivery work.

[Download workflow JSON](workflow.json) · [Regression checks](tests/workflow.test.cjs) · [Setup and customization](https://paoloronco.it)

## Quick overview

- One repository and branch per configured workflow, with a manual trigger and an inactive six-hour schedule.
- Default budgets: **40 logical GitHub requests, 20 snapshot files and 5 completed commit details per run**.
- SHA-pinned snapshots, unchanged-blob caching, priority scanning of new commits, and a separate historical backfill cursor.
- Provider patterns, literal-assignment checks, entropy/context filtering, and separate incident/email confidence thresholds.
- Redacted Notion incidents, durable delivery receipts, and one email digest per batch when required.
- **37 operational nodes and 9 English sticky notes**. The JSON preserves the source canvas layout and contains no credential bindings or private incident database references.

This is a configurable source template available on GitHub. It has not been submitted to n8n Creators.

## How it works

1. **Start and configure:** load the repository, branch, budgets and delivery settings.
2. **Load persistent state:** create or reuse `secrets_monitor_v4_state`, validate its schema and initialize the repository row.
3. **Acquire a lease:** a conditional update prevents overlapping scans of the same scope.
4. **Scan and detect:** inspect available new commits first, then continue eligible snapshot files and historical commit patches within the budgets.
5. **Queue results:** save the pending batch before creating incidents or delivering a digest.
6. **Track incidents:** look up each finding hash in Notion, create missing records, and save each incident receipt.
7. **Notify:** email candidates above the email threshold and operational errors or coverage gaps. Lower-confidence candidates remain available in Notion for review.
8. **Confirm progress:** persist delivery receipts, commit acknowledged cursors and release the lease.

## Requirements

- An n8n installation with the native **Data Table** node, including create-if-missing and lookup by table name, and JavaScript Code nodes. The template uses only native n8n node types.
- GitHub access to the configured repository. For a fine-grained token, grant access to that repository with **Contents: read**. Organization policies may require separate approval.
- A Notion integration with read/insert access to the incident database.
- SMTP credentials and a sender address accepted by that SMTP service.

The exact oldest compatible n8n release has not been established. No external scanner, shell access, AI service or use of detected credentials is required.

## Setup

### 1. Import and configure the repository

Download `workflow.json` and import it into a **new, empty workflow**. Importing into an existing canvas can append another set of nodes. Keep the workflow inactive while configuring it.

In **V4 · Config: Target Repository**, replace:

| Setting | Template value | Configure |
| --- | --- | --- |
| `github_owner` | `your-github-owner` | Repository owner or organization |
| `github_repo` | `your-repository` | Repository name |
| `target_branch` | `main` | Branch to monitor |
| `alert_from_email` | `security@example.com` | Sender authorized by your SMTP service |
| `alert_to_email` | `you@example.com` | Incident recipient |

The repository and email values above are setup placeholders. Replace all four before running the workflow.

### 2. Connect GitHub and SMTP

- On **V4 · GitHub: Fetch Blob**, select an **HTTP Header Auth** credential with header `Authorization` and value `Bearer YOUR_GITHUB_TOKEN`. The same node executes the planner's repository API requests.
- Select the same suitable SMTP credential on **V4 · Send an Email** and **V4 · Send Scan Error Alert Email**.
- Keep credentials in n8n's credential store; do not paste them into the Config node or workflow JSON.

### 3. Prepare the Notion incident database

Create a database with these exact, case-sensitive property names and types, then grant the Notion integration access:

| Property | Type | Values or purpose |
| --- | --- | --- |
| Name | Title | Incident title |
| Finding Hash | Text | Stable finding identifier used by the lookup |
| Repository | Text | Owner/repository |
| File Path | Text | File path and line |
| Masked Secret | Text | Always `[REDACTED]` |
| Author | Text | Scan attribution |
| Severity | Select | `CRITICAL`, `HIGH`, `MEDIUM` |
| Status | Select | `Open`, `Needs Review`, `Test` |
| Commit URL | URL | Source location at a commit |
| Secret Fingerprint | Text | Redacted correlation identifier |

Select that database and the Notion credential on **both** Notion nodes: **Check Deduplication Hash** and **Log Incident & Status**. Their database selectors are intentionally empty in the template. Keep **Simplify disabled** so recovery logic can read the complete Notion response and creation timestamp. Preserve the property mappings and hash filter.

### 4. Check persistent storage

The first run creates or reuses the native table `secrets_monitor_v4_state` in the workflow's project:

| Column | Type |
| --- | --- |
| key | String |
| payload | String |
| owner | String |
| lease | Number |

Scopes use `owner/repository@branch`; controlled tests use a separate `#controlled-test` suffix. Do not delete or edit active state rows. Use a separate n8n project when isolating independent deployments with their own state.

### 5. Verify delivery, then scan

1. Set `test_fixture=true` and run manually. This injects a synthetic detector fixture under a separate test scope without fetching repository content. It is not a real exposed credential.
2. Confirm a `[TEST]` incident in Notion with Status `Test` and Masked Secret `[REDACTED]`, and check the received email.
3. Repeat the test and check that it reuses the incident and does not send another acknowledged digest.
4. Restore `test_fixture=false`, then run a real bounded batch. Review the batch summary, coverage gaps and Notion candidates.
5. Continue batches to complete the initial eligible snapshot and available historical backfill. Pending coverage is not a clean scan result.
6. Review the six-hour schedule and instance time zone, then enable the workflow when the configuration and observed output are satisfactory.

## Defaults and customization

| Setting | Default | Meaning |
| --- | ---: | --- |
| `history_enabled` | `true` | Inspect available historical commit patches |
| `test_fixture` | `false` | Enable only for the controlled delivery test |
| `max_requests_per_run` | 40 | Logical GitHub request budget; excludes Notion and SMTP operations |
| `max_files_per_run` | 20 | Snapshot file budget |
| `max_commits_per_scan` | 5 | Completed commit-detail budget, including recent/history work |
| `max_file_bytes` | 500000 | Maximum eligible snapshot file size |
| `max_snapshot_files` | 10000 | Snapshot safety cap |
| `max_findings_per_run` | 100 | Stop threshold checked between responses; one response can add multiple findings, up to the hard cap of 500 |
| `minimum_confidence` | 75 | Minimum confidence for a candidate to enter the outbox |
| `email_minimum_confidence` | 85 | Minimum confidence for candidate email inclusion |

The validator rejects values outside supported ranges. A finding at or above the email threshold is `Open`; a retained candidate below it is `Needs Review`. Neither status confirms that a credential is active.

Provider rules cover GitHub, AWS access key identifiers, Google, AI-provider, Slack and Stripe patterns, private-key material and credential-bearing database URIs. Generic assignments require literal values and additional entropy/context checks. Generic test/example assignments are downranked; provider-specific matches remain active in those paths.

Tune the schedule, budgets and thresholds in the Config/trigger nodes. Rule and exclusion changes require editing the embedded shared code consistently across its Code nodes. Review cache invalidation when changing detector behavior. Keep the email threshold at or above the incident threshold.

## Recovery and troubleshooting

| Symptom | Check |
| --- | --- |
| GitHub 401/403 | Credential, repository access, token authorization and quota diagnostics |
| Rate limit | Persisted cooldown; allow it to expire before the next run |
| Lease already held | Another run or a recently failed run; the lease expires 15 minutes after its last refresh |
| Notion validation error | Integration access, both database selectors, exact property types/options, and Simplify disabled |
| SMTP rejection | Approved sender, SMTP authentication and recipient policy |
| Pending delivery | Resolve the service error; the next run replays the saved outbox before fetching more repository content |
| Incomplete coverage | Inspect the reported gaps, file exclusions, size limits, missing patches and remaining cursors |

The workflow timeout is 300 seconds. A failed execution can leave its lease until expiry; do not start concurrent manual recovery runs by editing an active lease.

## Privacy and scope

Notion, emails and durable scan state contain redacted values and fingerprints. Raw GitHub responses exist transiently during execution. Successful, failed and manual execution-data storage is disabled in the template; enabling it can retain repository source in n8n.

The scan covers the configured branch's eligible text files and available added/removed commit patch lines. Generated/vendor paths, binaries, files above limits, missing/truncated patches and GitHub API limits constrain coverage. This is not a complete Git audit, a provider credential-validity test or an automatic remediation service. Confirm findings and rotate/revoke exposed credentials through the appropriate provider.

SMTP delivery is **at least once**: interruption after SMTP acceptance but before saving its receipt can repeat a digest. Durable receipts and hash lookups reduce replay; they do not provide exactly-once email delivery.

## Validation

Run the offline regression checks against the JavaScript embedded in this exact public JSON:

```sh
node --test tests/workflow.test.cjs
```

These checks simulate API responses and cover request/file budgets, recent-commit priority, cursor continuity, cooldown, redaction, detection thresholds, delivery checkpoint guards and graph integrity. They do not authenticate to providers or send email.

The configured source workflow was also exercised with a synthetic Notion incident and email delivery, duplicate suppression, real bounded repository batches, cursor resumption and recovery of a pending batch after an SMTP sender rejection. Its initial full scan was still pending when the template was prepared. The sanitized JSON has not been executed as a separately configured fresh import; configure and verify it in your environment using the steps above.

## Contact

For workflow setup and customization, visit [paoloronco.it](https://paoloronco.it).
