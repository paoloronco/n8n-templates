# V3 validation

## Automated checks

42 local checks passed across the catalog engine, setup engine and bundled n8n node contracts. Coverage includes automatic provisioning, all 14 property types and values, repeatability, pagination, API limits, uncertain create responses, conflicting column types, partial failures, personal content, secret blocking, large files and attachment corruption.

The setup request is checked for an explicit JSON body and preservation of the requested Notion API version. Date comparisons use Notion's minute precision.

## Integration checks

- Imported the setup companion and main workflow into n8n and ran against a separate Notion catalog.
- Created a dedicated page, inline database, all 14 typed columns and a Setup and restore subpage through the companion.
- Verified three source workflows, including an inactive scheduled workflow and workflows with multiple trigger types and tags.
- Completed two final full-verification runs with 3/3 sources processed and no failures. Reused the same catalog rows and JSON attachments.
- Downloaded all three complete JSON files separately and checked their identity, byte length, SHA-256 and graph information against the catalog.
- Changed a disposable row's node count to an incorrect value and added a personal note. The next backup repaired the count and preserved the note.
- Imported a recovered workflow into a separate inactive n8n copy: 49 processing nodes and seven sticky notes were restored. The source workflow was not executed as part of that import check.

## Release checks

The public workflows import inactive. Credential bindings, private account configuration, workflow instance metadata, pinned data and execution cache are removed. Existing main-workflow node IDs, positions, sticky-note text and geometry are retained; the owner's public documentation link remains intentional.

The repository and downloadable bundle are verified separately after publication. These checks establish the tested behavior and file integrity; they do not imply n8n Creator Portal submission or approval.
