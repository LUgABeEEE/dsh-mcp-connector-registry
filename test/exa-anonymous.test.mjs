import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const descriptor = JSON.parse(readFileSync(new URL('../connectors/exa-search.json', import.meta.url)));
const record = JSON.parse(readFileSync(new URL('../candidates/records/exa-search.json', import.meta.url)));

test('Exa card stays anonymous and exposes only three basic tools', () => {
  assert.deepEqual(descriptor.auth, { mode: 'none' });
  assert.equal(descriptor.featured, false);
  assert.equal(descriptor.servers.length, 1);
  const server = descriptor.servers[0];
  const url = new URL(server.url);
  assert.equal(url.origin + url.pathname, 'https://mcp.exa.ai/mcp');
  assert.deepEqual([...url.searchParams.keys()], ['tools']);
  assert.deepEqual(url.searchParams.get('tools').split(',').sort(),
    ['web_fetch_exa', 'web_search_advanced_exa', 'web_search_exa']);
  assert.equal(server.oauthResource, undefined);
  assert.deepEqual(server.headers, { Accept: 'application/json, text/event-stream' });
  assert.doesNotMatch(JSON.stringify(descriptor.prompts), /agent_run|budget|maxCostDollars/);
  assert.equal(descriptor.promptVariables.some(v => v.name === 'question'), false);
});

test('Exa active acceptance reflects anonymous scope instead of old OAuth report', () => {
  assert.equal(record.authentication.mode, 'none');
  assert.equal(record.transports[0].url, descriptor.servers[0].url);
  assert.equal(record.probe.targetUrl, descriptor.servers[0].url);
  assert.equal(record.probe.httpStatus, 200);
  assert.match(record.runtimeAcceptance.reportUrl, /exa-2026-10-17/);
  assert.equal(record.score.total, Object.values(record.score.dimensions).reduce((a, b) => a + b, 0));
  for (const evidence of record.evidence.filter(e => ['probe', 'runtime-acceptance'].includes(e.type))) {
    assert.equal(evidence.url, record.runtimeAcceptance.reportUrl);
  }
});
