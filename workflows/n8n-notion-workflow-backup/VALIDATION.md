# Verification scope

The revision changes canvas positions and sticky notes. All 25 operating nodes in the main workflow and all 10 in the required setup companion retain their original IDs, names, parameters and connections. No runtime feature was added.

The canonical source was retrieved from paoloronco/n8n-templates, workflows/n8n-notion-workflow-backup/workflow.json. Its Git blob was independently checked: 26c6b2118030dc6dd8b8916bf9517876f7e98a2b. Original downloaded bytes are preserved separately.

- 42 existing behavioral/runtime tests passed, covering discovery, repeats, changed sources, large attachments, owner notes, byte verification, failed requests, retry limits and companion provisioning. External APIs are simulated in these tests.
- The five runtime-contract tests were also run against the exact revised JSON files. These are repeated checks from the suite, not five additional distinct scenarios.
- All 13 Code nodes compiled. Unique node identities, valid connections/references, enabled operating nodes, inactive workflows and absence of bound credentials or pinned data were checked.
- One yellow overview per workflow follows the How it works / Setup / Customization structure. Main overview: 220 words; companion overview: 189 words. Each white section note has fewer than 50 words.
- Native n8n imports and native re-export comparisons verify the saved review drafts. No Gmail, Notion content write, email or publication action was executed by these drafts during this revision. The owner's production backup was compared before and after import and remained unchanged.

The prior implementation has separate historical live-account evidence, including unchanged/changed runs and recovered JSON imports. It is not described as a new live-provider acceptance test of this revision. Configure the intended accounts and perform the README's manual/repeat/download/restore checks before enabling unattended operation.

No GitHub, Gumroad or Creator Portal publication/submission is included. Creator approval remains an independent review decision.

UI export comparison also passed after normalizing known omitted default parameters and the local webhook IDs that n8n generates for Wait/email nodes on opening the editor. Those generated IDs are excluded from the public files.
