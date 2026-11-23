# Validation scope — V4

The public `workflow.json` contains 30 nodes: 24 operational nodes and 6 sticky notes. It uses the unified runtime with catalog setup in the same workflow. The final owner refinement changes 13 node positions and the dimensions of 2 sticky notes. Operational code, node identities, connections and sticky-note text are unchanged by that refinement.

## Automated checks

- All 54 existing behavioral, provisioning, endpoint and runtime-contract checks passed against the exact distribution JSON.
- The checks cover discovery and pagination, changed and unchanged sources, large JSON attachments, byte/hash verification, personal-content preservation, bounded retries, setup reuse, compatible schemas and published endpoint metadata.
- Runtime-contract checks compile the Code nodes and verify the HTTP request paths, bodies and download handling.
- The public artifact was checked for credential bindings, owner email addresses, private instance/resource identifiers and owner documentation links. Destination configuration uses generic examples and empty IDs.
- Node positions, sticky-note geometry and structural identities were compared with a fresh owner export. The execution graph matches the previously verified unified runtime.

## Recorded real-account checks of the same runtime

- A full instance run processed 64 eligible sources: 48 updated and 16 unchanged, with no failures, retries or warnings.
- A setup-only run verified the existing catalog and 17 managed properties without exporting source workflows.
- A changed-source run updated documentation and the JSON attachment. The next unchanged-source run reused the same page, attachment, bytes and SHA-256 digest.
- A JSON attachment downloaded from Notion was imported into a separate inactive n8n workflow. Its nodes and connections matched the downloaded export. The restore copy and validation workflows were then archived.

These recorded checks used configured accounts. The public template intentionally removes those bindings and requires the importing user to configure and test their own instance. The final geometry-only refinement was checked structurally and with the automated suite; no additional live publication or source-workflow execution was needed for it.

GitHub availability is separate from Gumroad delivery updates and n8n Creator Portal approval. V4 has not been submitted to the Creator Portal as part of this release.
