import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { validateRegistryDescriptors } from '../node_modules/dsh-mcp-connector/lib/probe.js';

test('Firefox draft stays unpublished and pins the narrow pages-only configuration', async () => {
  const draft = JSON.parse(await readFile(new URL('../candidates/drafts/firefox-2026-10-24/firefox-devtools.json', import.meta.url), 'utf8'));
  const catalog = JSON.parse(await readFile(new URL('../catalog.json', import.meta.url), 'utf8'));
  assert.equal(validateRegistryDescriptors([draft]).length, 1);
  assert.equal(draft.published, false);
  assert.equal(draft.featured, false);
  assert.equal(draft.probeStatus, 'unverified');
  assert.equal(draft.auth.mode, 'none');
  assert.equal(draft.servers.length, 1);
  assert.equal(draft.servers[0].transport, 'stdio');
  assert.equal(draft.servers[0].command, 'npx');
  assert.deepEqual(draft.servers[0].args, ['-y', '@mozilla/firefox-devtools-mcp@0.10.6', '--headless', '--tools', 'pages', '--start-url', 'about:blank']);
  assert.equal(draft.servers[0].env, undefined);
  assert.match(draft.description, /不是全只读/);
  assert.match(draft.description, /独立 profile 不是操作系统沙箱/);
  assert.match(draft.description, /未完成独立 DSH Desktop 验收和人工批准/);
  assert.match(draft.prompts[0].text, /不传 saveTo/);
  assert.equal(catalog.connectors.some(item => item.id === draft.id), false);
});
