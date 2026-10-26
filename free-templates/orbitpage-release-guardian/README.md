# OrbitPage Release Guardian — Monitor, Approve and Roll Back Website Releases

## Quick overview

Monitor OrbitPage revisions, compare changes with the last verified release, and check the live website after publication. Optionally approve private drafts by email. If a published page fails its HTTP check, request human approval before restoring an available earlier revision.

## How it works

1. **Start:** Run manually or use the OrbitPage trigger, which polls for saved revision changes every minute.
2. **Read:** Retrieve the workspace overview, full draft, publication status and revision/ETag information.
3. **Analyze:** Compare selected public-facing fields against the last verified snapshot and flag placeholders, unsafe URL protocols or invalid publication metadata.
4. **Route:** Skip unchanged revisions; optionally request approval for unpublished private drafts; send newly published dashboard revisions to verification.
5. **Approve publication (optional):** Email a one-time resume link and publish the reviewed draft using its ETag after approval.
6. **Verify:** Request the public page and check its HTTP status, response length and obvious maintenance text. Save successful release metadata for future comparisons.
7. **Handle failure:** Check whether an earlier verified revision is available. If so, email a rollback approval link; otherwise notify the recipient and stop.
8. **Restore and recheck:** After approval, restore the selected version with an ETag concurrency check and verify the public page again.

## Setup

1. **Import:** Import the supplied workflow JSON into n8n.
2. **Install OrbitPage nodes:** Install the `n8n-nodes-orbitpage` community package (version `0.3.2` or newer, as indicated by the workflow notes).
3. **Connect OrbitPage:** Create an OrbitPage API credential and select it on every OrbitPage node, including the trigger, publication and backup operations.
4. **Grant scopes:** Ensure the API token has `workspace:read`, `publication:read`, `publication:write`, `backup:read` and `backup:write` for the operations used.
5. **Connect Gmail:** Configure Gmail OAuth2 credentials on all email nodes and verify that the account can send messages.
6. **Set the recipient:** In `Configuration`, replace `REPLACE_WITH_APPROVAL_EMAIL` with your email address.
7. **Choose safe defaults:** Keep `ENABLE_PUBLISH=NO` for ordinary dashboard editing. Use `SEND_SUCCESS_EMAIL=YES` for initial testing and review `approval_timeout_hours` (default `24`).
8. **Test:** Run `When Manually Started`, inspect `Analyze Draft` and the resulting branch, and confirm the public URL and publication status. Test approval and rollback paths in a non-production workspace before enabling them.
9. **Activate:** Enable the workflow only after verifying the credentials, recipient, revision behavior and public-page checks.

## Requirements

- n8n Cloud or self-hosted with support for the imported workflow nodes, community nodes and workflow static data.
- OrbitPage workspace and API token with the required read, publication and backup permissions.
- `n8n-nodes-orbitpage` community integration, version `0.3.2` or newer according to the embedded guide.
- Gmail OAuth2 credentials with permission to send approval, success and failure emails.
- Public HTTPS URL for the OrbitPage page, reachable from the n8n instance.
- Working n8n Wait-node resume webhooks for email approvals.
- Available historical OrbitPage revisions for the rollback path.

## Use cases

- **Website release monitoring:** Detect new published revisions and verify that the public page responds after dashboard edits.
- **Private draft review:** Require email approval before publishing eligible API- or ChatGPT-created drafts.
- **Change visibility:** Identify modified sections and added, changed or removed top-level links relative to the last verified snapshot.
- **Assisted recovery:** Request approval to restore a previously verified revision after a failed live check.
- **Release notifications:** Send confirmation emails for verified publications and alerts for blocked releases or failures.

## Customization

- **`Configuration`:** Set `approval_email`, `ENABLE_PUBLISH`, `SEND_SUCCESS_EMAIL` and `approval_timeout_hours`.
- **`When OrbitPage Saved Revision Changes`:** Review the one-minute polling interval and the connected workspace.
- **`Analyze Draft`:** Adjust the fields included in the snapshot, placeholder detection, URL checks and rules that block private-draft publication.
- **`Send Publication Approval` / `Wait for Publication Approval`:** Customize approval email content and expiration settings.
- **`Check Published Page` / `Verify Published Page`:** Adjust the public HTTP smoke-test criteria, retry behavior and minimum response length.
- **`Get Versions for Rollback` / `Prepare Rollback Approval`:** Review historical-version eligibility and the rollback approval message.
- **`Send Verified Release Email` / `Send Blocked Release Alert` / `Send Failure Without Rollback`:** Customize notification wording and recipients.

## Additional info

- **Publishing is opt-in:** `ENABLE_PUBLISH=NO` disables the private-draft approval/publish branch; dashboard-published revisions can still be checked.
- **No unattended rollback:** Restoration requires a human to follow the approval link. The workflow uses revision/ETag checks to reduce the risk of acting on changed state.
- **First run:** With no previous verified snapshot, the workflow establishes a baseline; it cannot roll back to a previously verified Guardian release until one exists.
- **Verification scope:** The live check is a basic HTTP smoke test, not a browser test, security scan, accessibility audit or guarantee that every page function works.
- **History:** Comparison data is stored in n8n workflow static data, not an external database. Persistence is intended for successful active production executions and may not behave the same in manual tests.
- **Approval-link security:** Treat resume URLs as sensitive bearer links. Avoid forwarding them, restrict access to the recipient mailbox and protect the n8n instance.
- **Failure behavior:** HTTP error responses are evaluated by the verification code; transport retries and application-level checks have different behavior. Inspect failed executions rather than assuming all errors are retried.
- **Concurrency:** The ETag checks can reject stale publish or restore operations. Such failures require manual review rather than forced execution.
- **Support:** [OrbitPage](https://orbitpage.com/) · [n8n templates repository](https://github.com/paoloronco/n8n-templates) · [n8n Creator profile](https://n8n.io/creators/paoloronco/) · [Contact](mailto:info@paoloronco.it).