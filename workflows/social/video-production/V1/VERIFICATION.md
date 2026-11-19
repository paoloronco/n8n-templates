# Verification — local worker 2.0.2

## Completed checks

| Check | Result |
| --- | --- |
| Python backend suite | 24 passed. |
| Node worker and exported-workflow suite | 13 passed. |
| Generic visual layouts | All four input-compatible layouts passed HyperFrames checks in strict mode, with no lint, runtime, layout, contrast, craft or audio findings. |
| Long-text and image fixtures | Two scenes per layout, including a 70-character title, 160-character body and a generated image fixture. Midpoint frames inspected. |
| Workflow structure | 76 nodes; 65 operational nodes enabled; workflow inactive; empty pinned data; all 21 credential selectors unbound. |
| Privacy review | Instance metadata removed; no personal account/channel identifiers, real credentials, private host/IP addresses, branded samples or original production assets in V1. Structural node UUIDs and generic loopback gallery addresses remain. |
| Distribution | Archive members and manifest checked against canonical repository file bytes. |

```bash
cd runtime
python3 -B backend_test.py
node --test worker.test.mjs workflow.test.cjs
```

## Scope

The visual check uses synthetic PCM test audio and generated image fixtures. It checks HTML assembly, media readability, text placement and contrast; it does not claim a new spoken-narration render or an Instagram/YouTube upload. No paid generation, public social post, purchase or Creator Portal submission was performed for this revision.

The runtime dependencies remain pinned in the lockfile. Run a reviewed private YouTube acceptance test with your own configuration before enabling real delivery. Keep existing receipts and approved original files when upgrading; use a fresh state directory for template tests.
