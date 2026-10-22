import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { validateRegistryDescriptors } from '../node_modules/dsh-mcp-connector/lib/probe.js';

test('Vostride documentation draft validates but stays unpublished pending terms and UI acceptance', async () => {
  const draft = JSON.parse(await readFile(new URL('../candidates/drafts/vostride-2026-10-22/vostride-docs.json', import.meta.url), 'utf8'));
  const catalog = JSON.parse(await readFile(new URL('../catalog.json', import.meta.url), 'utf8'));
  assert.equal(validateRegistryDescriptors([draft]).length, 1);
  assert.equal(draft.published, false);
  assert.equal(draft.probeStatus, 'unverified');
  assert.equal(draft.auth.mode, 'none');
  assert.equal(draft.servers[0].url, 'https://vostride.com/mcp');
  assert.match(draft.description, /不执行本地 QA 测试/);
  assert.match(draft.description, /请勿包含凭据/);
  assert.equal(catalog.connectors.some(item => item.id === draft.id), false);
});
