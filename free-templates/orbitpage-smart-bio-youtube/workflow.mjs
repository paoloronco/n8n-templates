import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// The owner's n8n export is authoritative. Never regenerate or tidy its canvas.
export function buildWorkflow() {
  return JSON.parse(readFileSync(new URL('./OrbitPage_Smart_Bio_YouTube.json',import.meta.url),'utf8'));
}

if (process.argv[1]===fileURLToPath(import.meta.url)) {
  const workflow=buildWorkflow();
  console.log(`Loaded ${workflow.nodes.length} nodes from the authoritative export; no files or canvas positions changed.`);
}
