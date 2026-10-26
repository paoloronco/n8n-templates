# OrbitPage AI Page Editor — Review and Publish Page Changes from Chat

## Quick overview

Chat with an AI page editor to inspect your OrbitPage workspace, understand your current page, and prepare validated edits. Review each proposal directly in n8n Chat, then approve publication or reject it. The workflow applies approved changes and retrieves the resulting publication status.

## How it works

1. **Receive:** An n8n Chat message starts the AI agent, using OpenAI and conversation memory for context.
2. **Inspect:** The agent reads the workspace overview, editable page draft, publication status, or AI allowance according to the request.
3. **Propose:** For an edit request, the agent asks OrbitPage to generate a validated preview. This uses OrbitPage AI allowance but does not modify or publish the page.
4. **Review:** The workflow displays the proposal summary, changes, reviewed revision, and expiration when provided, with **Approve and publish** and **Reject** buttons.
5. **Decide:** Approval sends the server-issued preview token to OrbitPage with publication enabled. Rejection leaves the page unchanged. The approval step waits up to nine minutes.
6. **Report:** After applying an approved preview, the workflow retrieves publication state and returns the available revision, status, and public URL in Chat.

## Setup

1. **Install the integration:** Install `n8n-nodes-orbitpage` version `0.3.2` or newer, as specified in the workflow notes, on an n8n instance that supports community packages.
2. **Import:** Import `OrbitPage_AI_Page_Editor.json` into n8n.
3. **Create an OrbitPage token:** Grant only `workspace:read`, `publication:read`, `publication:write`, `ai:read`, and `ai:write` for the operations used.
4. **Connect OrbitPage:** Create your OrbitPage API credential and select it on every OrbitPage node, including the agent tools, apply node, and publication verification node.
5. **Connect OpenAI:** Select your OpenAI API credential in `OpenAI Chat Model`. The imported workflow uses `gpt-5-mini`.
6. **Protect Chat:** Keep the Chat Trigger private during testing. Configure authentication before sharing a production Chat URL, since users with access can request edits and approve publication in the connected workspace.
7. **Test reads:** Open n8n Chat and ask about the current page or publication status. Verify that the responses match your workspace.
8. **Test decisions:** Request a small edit, review the preview, and test rejection first. Repeat with an edit you intend to publish and verify the approval result in OrbitPage.
9. **Enable production:** Publish the workflow after checking credentials, Chat access, approval behavior, and execution-data retention.

## Requirements

- n8n 2.x with support for the Chat Trigger, Chat approval responses, AI Agent, and imported node versions, as indicated by the workflow notes.
- An n8n deployment that permits installation of the `n8n-nodes-orbitpage` community integration.
- An OrbitPage workspace and API token with the five required scopes.
- Available OrbitPage AI allowance for generating edit proposals.
- OpenAI API credentials with access to the configured model.
- Outbound connectivity from n8n to OrbitPage and OpenAI.

## Use cases

- **Page review:** Ask the editor to explain the current draft and suggest improvements.
- **Copy updates:** Request clearer descriptions, revised wording, or other supported content changes.
- **Publication checks:** Inspect draft and publication status from Chat.
- **Controlled editing:** Review a validated proposal before applying and publishing it.

## Customization

- **Model:** Change the model in `OpenAI Chat Model` to one compatible with the agent's tool calling.
- **Agent instructions:** Adjust tone, language, and editing guidance in `OrbitPage AI Page Editor` while retaining the preview and approval rules.
- **Conversation context:** Adjust `Conversation Memory`, currently configured with a context window length of `20`.
- **Approval:** Customize button labels and the nine-minute wait limit in `Review Preview in Chat`, keeping the wait compatible with the preview expiration.
- **Response formatting:** Edit `Prepare Chat Response`, `Format Publication Result`, and `Report Cancelled Publication` to change user-facing messages.
- **Workspace:** Select the appropriate OrbitPage credential across all related nodes when using a different workspace.

## Additional info

- **Approval publishes:** Clicking **Approve and publish** applies the reviewed proposal and requests publication; there is no separate save-only step in this template.
- **Agent permissions:** The AI agent has four read tools and one preview tool. The apply-and-publish node runs through the workflow's approval branch and is not exposed as an agent tool.
- **Preview handling:** The agent is instructed to create at most one preview per message, keep edit instructions within 600 characters, and avoid automatic retries after preview errors.
- **Expired or changed state:** OrbitPage can reject expired or stale previews. Request a fresh proposal after reviewing the current page rather than reusing an old approval.
- **Scope:** Account, billing, domain, Shop, newsletter, team, media deletion, backup, and restore actions are outside this editor's configured tools.
- **Data handling:** Page content and proposals may appear in n8n execution data, and content used by the agent is processed through the configured OpenAI model. Review retention and access settings before production use.
- **Costs:** OpenAI API usage and OrbitPage AI previews have separate usage limits or charges. A rejected proposal has already used preview allowance.
- **Verification:** The final step retrieves OrbitPage publication state; it does not perform a browser or HTTP check of the live page. Review the reported status before assuming publication completed.
- **Testing:** This README describes the supplied workflow. End-to-end behavior must be tested with your own n8n deployment, credentials, and OrbitPage workspace.
- **Author:** Created by [Paolo Ronco](https://paoloronco.it/), also the creator of OrbitPage.
- **Resources:** [OrbitPage](https://orbitpage.com/) · [n8n templates repository](https://github.com/paoloronco/n8n-templates) · [n8n Creator profile](https://n8n.io/creators/paoloronco/).
- **Support:** OrbitPage: [contact@orbitpage.com](mailto:contact@orbitpage.com). Workflow: [info@paoloronco.it](mailto:info@paoloronco.it) or [contact@orbitpage.com](mailto:contact@orbitpage.com).
