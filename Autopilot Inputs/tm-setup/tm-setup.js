// Idempotent Test Manager setup for the Oracle Fusion ERP demo.
// Usage: node tm-setup.js <fields|reqs|tcs|link|values|verify|all>
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { TAG, FIELDS, REQS, TCS } = require('./tm-data');

const PROJECT = 'OFA';
const UIP = path.join(process.env.APPDATA, 'npm', 'node_modules', '@uipath', 'cli', 'dist', 'index.js');
const STATE_FILE = path.join(__dirname, 'tm-oracle-ids.json');
const state = fs.existsSync(STATE_FILE) ? JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) : { reqs: {}, tcs: {}, fields: {} };
const save = () => fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));

function uip(args) {
  const r = spawnSync(process.execPath, [UIP, 'tm', ...args, '--project-key', PROJECT, '--output', 'json'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  let out;
  try { out = JSON.parse(r.stdout); } catch { throw new Error(`Unparseable output for ${args.slice(0, 2).join(' ')}:\n${r.stdout}\n${r.stderr}`); }
  if (out.Result !== 'Success') throw new Error(`${args.slice(0, 2).join(' ')} failed: ${JSON.stringify(out)}`);
  return out.Data;
}

function fields() {
  const existing = uip(['customfield', 'list']);
  for (const f of FIELDS) {
    if (existing.some(e => e.Name === f.name)) { console.log(`field exists: ${f.name}`); continue; }
    const d = uip(['customfield', 'create', '--name', f.name, '--data-type', 'Label', '--scope-list', ...f.scope,
      '--description', f.description, '--value-hints', f.hints]);
    state.fields[f.name] = d.Id || d;
    console.log(`field created: ${f.name}`);
    save();
  }
}

// Label "possible values" are read from ValueHints as a comma-separated list.
function fixhints() {
  const existing = uip(['customfield', 'list']);
  for (const f of FIELDS) {
    const def = existing.find(e => e.Name === f.name);
    if (!def) { console.log(`missing field: ${f.name}`); continue; }
    if (def.ValueHints === f.hints) { console.log(`hints ok: ${f.name}`); continue; }
    uip(['customfield', 'update', '--field-id', def.Id, '--value-hints', f.hints]);
    console.log(`hints updated: ${f.name} -> ${f.hints}`);
  }
}

function reqs() {
  for (const r of REQS) {
    if (state.reqs[r.key]) { console.log(`req exists: ${r.key}`); continue; }
    const d = uip(['requirements', 'create', '--name', r.name, '--description', r.desc]);
    state.reqs[r.key] = { id: d.Id, objKey: d.ObjKey };
    console.log(`req created: ${r.key} -> ${d.ObjKey}`);
    save();
  }
}

function tcs() {
  for (const t of TCS) {
    if (!state.tcs[t.key]) {
      const d = uip(['testcases', 'create', '--name', t.name, '--description', t.desc]);
      state.tcs[t.key] = { id: d.Id, objKey: d.TestCaseKey, steps: false };
      console.log(`tc created: ${t.key} -> ${d.TestCaseKey}`);
      save();
    }
    if (!state.tcs[t.key].steps) {
      const stepArgs = t.steps.flatMap(st => ['--step', JSON.stringify(st)]);
      uip(['testcases', 'steps', 'add', '--test-case-id', state.tcs[t.key].id, ...stepArgs]);
      state.tcs[t.key].steps = true;
      console.log(`  steps added: ${t.steps.length}`);
      save();
    }
  }
}

function link() {
  for (const r of REQS) {
    const tcIds = TCS.filter(t => t.reqs.includes(r.key)).map(t => state.tcs[t.key].id);
    if (!tcIds.length) continue;
    uip(['requirements', 'testcases', '--requirement-id', state.reqs[r.key].id, '--add-testcase-ids', ...tcIds]);
    console.log(`linked ${r.key} <- ${TCS.filter(t => t.reqs.includes(r.key)).map(t => t.key).join(', ')}`);
  }
}

function values() {
  const apply = (type, id, cf) => uip(['customfield', 'label', 'create', '--object-type', type, '--object-id', id,
    '--values', JSON.stringify(Object.fromEntries(Object.entries(cf).map(([k, v]) => [k, [v]])))]);
  for (const r of REQS) { apply('Requirement', state.reqs[r.key].id, r.cf); console.log(`values set: ${r.key}`); }
  for (const t of TCS) { apply('TestCase', state.tcs[t.key].id, t.cf); console.log(`values set: ${t.key}`); }
  uip(['objectlabel', 'add', '--object-type', 'Requirement', '--object-ids', ...REQS.map(r => state.reqs[r.key].id), '--labels', TAG]);
  uip(['objectlabel', 'add', '--object-type', 'TestCase', '--object-ids', ...TCS.map(t => state.tcs[t.key].id), '--labels', TAG]);
  console.log(`tag "${TAG}" added to ${REQS.length} requirements and ${TCS.length} test cases`);
}

function verify() {
  const f = uip(['customfield', 'list']);
  console.log(`fields in project: ${[...new Set(f.map(x => x.Name))].join(', ')}`);
  for (const r of REQS) {
    const ids = uip(['requirements', 'list-testcase-ids', '--requirement-id', state.reqs[r.key].id]);
    const lab = uip(['customfield', 'label', 'list', '--object-type', 'Requirement', '--object-id', state.reqs[r.key].id]);
    console.log(`${state.reqs[r.key].objKey} ${r.key}: ${Array.isArray(ids) ? ids.length : JSON.stringify(ids)} TC(s); fields ${Object.keys((lab[0] || {}).Values || {}).length}`);
  }
  for (const t of TCS) {
    const st = uip(['testcases', 'steps', 'list', '--test-case-id', state.tcs[t.key].id]);
    const lab = uip(['customfield', 'label', 'list', '--object-type', 'TestCase', '--object-id', state.tcs[t.key].id]);
    console.log(`${state.tcs[t.key].objKey} ${t.key}: ${Array.isArray(st) ? st.length : '?'} steps; fields ${Object.keys((lab[0] || {}).Values || {}).length}`);
  }
}

const phases = { fields, fixhints, reqs, tcs, link, values, verify };
const which = process.argv[2] || 'all';
(which === 'all' ? ['fields', 'reqs', 'tcs', 'link', 'values', 'verify'] : [which]).forEach(p => { console.log(`== ${p}`); phases[p](); });
