const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const workflow = JSON.parse(fs.readFileSync(path.join(root, 'Gmail_Invoice_Archiving_SFTP_V2.1.json'), 'utf8'));
const fixtures = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures.json'), 'utf8'));
const nodes = Object.fromEntries(workflow.nodes.map(n => [n.name, n]));
const bytes = Buffer.alloc(100, 65);
const pdf = () => ({ data: { data: bytes.toString('base64'), mimeType: 'application/pdf', fileName: 'invoice.pdf' } });
let passed = 0;
async function check(name, fn) { await fn(); passed++; process.stdout.write(`PASS ${name}\n`); }
async function run(name, input, refs = {}, helper) {
  const sandbox = { Buffer, item: input[0], items: input, $json: input[0]?.json || {},
    $input: { all: () => input, item: input[0], first: () => input[0] },
    $: key => ({ item: refs[key]?.[0], first: () => refs[key]?.[0],
      all: () => refs[key] || [], itemMatching: i => refs[key]?.[i] }),
    helpers: { getBinaryDataBuffer: helper || (async (i, key) => Buffer.from(input[i].binary[key].data, 'base64')) } };
  return new vm.Script('(async function(){' + nodes[name].parameters.jsCode + '\n}).call({helpers})')
    .runInNewContext(sandbox, { timeout: 2000 });
}
function source(f, extra = {}) {
  return { json: { id: 'synthetic-message', attachmentKey: 'pdf-1', originalFileName: 'invoice.pdf',
    from: f.from, subject: f.subject, ...extra }, binary: pdf() };
}
async function parse(f, text = f.text) {
  return run('Parse invoice and canonical name', [{ json: { text } }], { 'Normalize PDF binary': [source(f)] });
}
const sample = () => ({ json: { provider: 'HostingProvider', tab: 'Hosting', invoiceNumber: '123456',
  date: '2026-11-20', amount: 12.2, fileName: '20261120 cloud HostingProvider 123456.pdf',
  pdfBytes: 100, sourceMessageId: 'm1', sourceAttachmentKey: 'a1', status: 'validated' }, binary: pdf() });
const assess = rows => run('Assess registered invoice', rows.map(json => ({ json })), { 'Prepare duplicate lookup': [sample()] });
const row = { 'Numero Fattura': '123456', 'Data Fattura': '2026-11-20', IMPORTO: 12.2 };
const outcome = (id, key, status) => ({ json: { sourceMessageId: id, sourceAttachmentKey: key, status,
  invoiceNumber: '123456', fileName: 'invoice.pdf' } });
const expected = [{ json: { id: 'm1', attachmentKey: 'a1' } }, { json: { id: 'm1', attachmentKey: 'a2' } },
  { json: { id: 'm2', attachmentKey: 'a1' } }];
const complete = items => run('Confirm completed invoice messages', items, { 'Normalize PDF binary': expected });

(async () => {
  await check('50 enabled nodes and inactive export', async () => {
    assert.equal(workflow.nodes.length, 50); assert.equal(workflow.active, false);
    assert(workflow.nodes.every(n => !n.disabled)); assert.deepEqual(workflow.pinData, {});
    assert(workflow.nodes.every(n => !n.credentials && !n.webhookId));
  });
  await check('all Code nodes compile', async () => {
    for (const n of workflow.nodes.filter(n => n.type.endsWith('.code')))
      new vm.Script('(async function(){' + n.parameters.jsCode + '\n})');
  });
  await check('graph edges and literal node references resolve', async () => {
    for (const [name, ports] of Object.entries(workflow.connections)) {
      assert(nodes[name]); for (const edges of ports.main) for (const edge of edges) assert(nodes[edge.node]);
    }
    for (const n of workflow.nodes) for (const match of JSON.stringify(n.parameters).matchAll(/\$\((?:'([^']+)'|\\"([^\\"]+)\\")\)/g))
      assert(nodes[match[1] || match[2]], `Unresolved reference in ${n.name}`);
  });
  await check('all six spreadsheet IDs require configuration', async () => {
    const sheets = workflow.nodes.filter(n => n.type.endsWith('.googleSheets'));
    assert.equal(sheets.length, 6); assert(sheets.every(n => n.parameters.documentId.value === 'REPLACE_WITH_SPREADSHEET_ID'));
  });
  for (const f of fixtures) await check(`parse fictional ${f.profile} ${f.type} invoice`, async () => {
    const r = await parse(f); assert.equal(r.json.status, 'validated'); assert.equal(r.json.provider, f.profile);
    assert.equal(r.json.invoiceNumber, f.invoiceNumber); assert.equal(r.json.amount, f.amount);
    assert.equal(r.json.tab, f.tab); assert.equal(r.json.date, '2026-11-20'); assert.equal(r.json.type, f.type);
    assert(r.json.targetPath.startsWith('/invoices/')); assert(r.binary.data);
  });
  await check('hosting profile reconciles net and tax', async () => {
    const r = await parse(fixtures[4]); assert.equal(r.json.netAmount, 10); assert.equal(r.json.vatAmount, 2.2);
  });
  await check('inconsistent hosting total enters review', async () => {
    assert.equal((await parse(fixtures[4], fixtures[4].text.replace('€ 12.20', '€ 15.00'))).json.status, 'review');
  });
  await check('unreadable PDF retains source identity and binary for review', async () => {
    const r = await parse(fixtures[0], ''); assert.equal(r.json.status, 'review');
    assert.equal(r.json.sourceMessageId, 'synthetic-message'); assert.equal(r.json.sourceAttachmentKey, 'pdf-1'); assert(r.binary.data);
  });
  await check('unknown profile enters review', async () => {
    assert.equal((await parse({ ...fixtures[0], from: 'unrecognized', text: 'Unrecognized invoice document with sufficient text but no supported profile.' })).json.status, 'review');
  });
  await check('cloud summary receives its own filename', async () => {
    const f = fixtures[3]; const r = await parse(f, f.text + '\nQuesto è un riepilogo della fattura elettronica');
    assert.equal(r.json.documentKind, 'summary'); assert(r.json.fileName.endsWith(' riepilogo.pdf'));
    const rows = await run('Prepare cloud register', [r]); assert.equal(rows[0].json.fileName, r.json.registerFileName);
    assert.equal(rows[0].json.savedDocuments[0].fileName, r.json.fileName);
  });
  await check('normalizer retains PDFs and skips other attachments', async () => {
    const input = [{ json: { id: 'm1' }, binary: { pdf: { ...pdf().data }, txt: { data: 'YQ==', fileName: 'readme.txt', mimeType: 'text/plain' } } }];
    const r = await run('Normalize PDF binary', input); assert.equal(r.length, 1); assert.equal(r[0].json.attachmentKey, 'pdf');
  });
  await check('normalizer checks actual bytes despite misleading size metadata', async () => {
    const input = [{ json: { id: 'm1' }, binary: { data: { ...pdf().data, fileSize: '1 KB' } } }];
    await assert.rejects(() => run('Normalize PDF binary', input, {}, async () => Buffer.alloc(20 * 1024 * 1024 + 1)), /20 MiB/);
  });
  await check('new invoice reaches upload decision', async () => assert.equal((await assess([{}]))[0].json.decision, 'upload'));
  await check('matching register proceeds to SFTP check', async () => assert.equal((await assess([row]))[0].json.decision, 'registered'));
  await check('localized and serial dates match ISO invoice date', async () => {
    for (const date of ['20/11/2026', (Date.UTC(2026, 10, 20) - Date.UTC(1899, 11, 30)) / 86400000])
      assert.equal((await assess([{ ...row, 'Data Fattura': date }]))[0].json.decision, 'registered');
  });
  await check('conflicting or incomplete register rows enter review', async () => {
    for (const rows of [[{ ...row, IMPORTO: 20 }], [{ ...row, 'Data Fattura': '2025-11-20' }], [{ ...row, IMPORTO: '' }], [row, row]])
      assert.equal((await assess(rows))[0].json.decision, 'review');
  });
  const archived = rows => run('Assess archived PDF', rows.map(json => ({ json })), { 'Assess registered invoice': [sample()] });
  await check('matching SFTP filename and byte size skip upload', async () => {
    assert.equal((await archived([{ name: sample().json.fileName, size: 100, type: '-' }]))[0].json.decision, 'duplicate');
  });
  await check('missing SFTP PDF is uploaded', async () => assert.equal((await archived([{}]))[0].json.decision, 'upload'));
  await check('SFTP size conflicts enter review', async () => {
    assert.equal((await archived([{ name: sample().json.fileName, size: 99, type: '-' }]))[0].json.decision, 'review');
  });
  await check('directory cannot be treated as duplicate PDF', async () => {
    assert.equal((await archived([{ name: sample().json.fileName, size: 100, type: 'd' }]))[0].json.decision, 'upload');
  });
  await check('review key remains stable across repeated attempts', async () => {
    const a = await run('Prepare review row', [sample()]); const b = await run('Prepare review row', [sample()]);
    assert.equal(a.json.uniqueKey, b.json.uniqueKey);
  });
  await check('review writes require matching confirmation', async () => {
    await assert.rejects(() => run('Review - retain source email', [{ json: { uniqueKey: 'wrong' } }],
      { 'Prepare review row': [{ json: { uniqueKey: 'expected' } }] }), /confirmation mismatch/);
  });
  await check('archived and verified duplicate PDFs complete the message', async () => {
    assert.equal((await complete([outcome('m1', 'a1', 'archived'), outcome('m1', 'a2', 'duplicate')])).length, 1);
  });
  await check('one review PDF retains the whole message', async () => {
    assert.equal((await complete([outcome('m1', 'a1', 'archived'), outcome('m1', 'a2', 'review')])).length, 0);
  });
  await check('independent valid messages can complete alongside review messages', async () => {
    const r = await complete([outcome('m1', 'a1', 'archived'), outcome('m1', 'a2', 'review'), outcome('m2', 'a1', 'duplicate')]);
    assert.equal(r.length, 1); assert.equal(r[0].json.sourceMessageId, 'm2');
  });
  await check('incomplete or repeated attachment outcomes cannot trash email', async () => {
    await assert.rejects(() => complete([outcome('m1', 'a1', 'archived')]), /Not all/);
    await assert.rejects(() => complete([outcome('m1', 'a1', 'archived'), outcome('m1', 'a1', 'archived')]), /Duplicate/);
  });
  await check('only final message confirmation reaches Gmail Trash', async () => {
    const incoming = Object.entries(workflow.connections).filter(([, p]) => p.main.flat().some(e => e.node === 'Gmail - Trash archived invoice')).map(([n]) => n);
    assert.deepEqual(incoming, ['Confirm completed invoice messages']);
  });
  process.stdout.write(`${passed} checks passed; no external services called.\n`);
})().catch(error => { process.stderr.write(error.stack + '\n'); process.exitCode = 1; });
