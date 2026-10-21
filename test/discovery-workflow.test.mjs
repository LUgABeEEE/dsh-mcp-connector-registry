import assert from 'node:assert/strict';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import {
  buildMonthlyBatch,
  renderMonthlyBatch,
  selectMonthlyBatch,
} from '../scripts/build-monthly-batch.mjs';
import { upsertDiscoveryIssue } from '../scripts/discovery/github-issue.mjs';

function candidate(index, overrides = {}) {
  return {
    registryName: `com.example/data-${index}`,
    title: `Data ${index}`,
    classification: { isDataService: true, domains: ['finance'] },
    source: { status: 'active' },
    dedupe: { level: 'none' },
    score: { band: 'watchlist', total: 90 - index },
    probe: { status: 'pass' },
    authentication: { mode: 'bearer' },
    license: { status: 'unknown' },
    officialLinks: { websiteUrl: `https://data-${index}.example.com`, repository: null },
    ...overrides,
  };
}

test('monthly review batch is bounded to 4-10 and excludes unsafe or duplicate candidates', () => {
  const candidates = Array.from({ length: 14 }, (_, index) => candidate(index));
  candidates.push(candidate(20, { dedupe: { level: 'strong' }, score: { band: 'duplicate', total: 99 } }));
  candidates.push(candidate(21, { probe: { status: 'fail' }, score: { band: 'defer', total: 98 } }));
  const selected = selectMonthlyBatch(candidates, { size: 10 });
  assert.equal(selected.length, 10);
  assert.deepEqual(selected.map((item) => item.registryName), Array.from({ length: 10 }, (_, index) => `com.example/data-${index}`));
  assert.equal(selectMonthlyBatch(candidates, { size: 4 }).length, 4);
  assert.throws(() => selectMonthlyBatch(candidates, { size: 3 }), /4 to 10/);
});
test('monthly report blocks rather than weakening gates when fewer than four qualify', () => {
  const report = { generatedAt: '2026-08-30T00:00:00.000Z' };
  const body = renderMonthlyBatch(report, [candidate(1)], { size: 10 });
  assert.match(body, /Blocked: fewer than four/);
  assert.match(body, /never opens or merges/);
});

test('monthly recovery refuses incomplete, unknown, incremental or malformed snapshots', () => {
  const report = { generatedAt: '2026-10-21T00:00:00Z', source: { complete: true }, candidates: [candidate(1)] };
  assert.equal(buildMonthlyBatch(report).candidates.length, 1);
  for (const complete of [false, undefined, 'true', null]) {
    assert.throws(() => buildMonthlyBatch({ ...report, source: { complete } }), /explicitly complete/);
  }
  assert.throws(() => buildMonthlyBatch(null), /explicitly complete/);
  assert.throws(() => buildMonthlyBatch({ ...report, source: { complete: true, updatedSince: '2026-10-20' } }), /incremental/);
  assert.throws(() => buildMonthlyBatch({ ...report, generatedAt: 'invalid' }), /timestamp/);
  assert.throws(() => buildMonthlyBatch({ ...report, candidates: null }), /candidates array/);
});

test('incomplete monthly CI preserves artifacts and fails rather than silently skipping publication', async () => {
  const workflow = await readFile(new URL('../.github/workflows/discovery.yml', import.meta.url), 'utf8');
  const artifact = workflow.indexOf('name: monthly-data-mcp-review-batch');
  const failure = workflow.indexOf('name: Fail visibly when the monthly source is incomplete');
  const publication = workflow.indexOf('name: Create or update the single monthly review issue');
  assert.ok(artifact < failure && failure < publication);
  assert.match(workflow.slice(failure, publication), /always\(\).*steps\.discover\.outcome == 'success'.*outputs\.complete == 'false'/);
  assert.match(workflow.slice(failure, publication), /core\.setFailed/);
});

test('monthly CLI preserves last-good output when recovery input is incomplete', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'registry-monthly-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const input = join(directory, 'report.json');
  const output = join(directory, 'monthly.md');
  await writeFile(input, JSON.stringify({ source: { complete: false }, candidates: [] }));
  await writeFile(output, 'last good monthly report');
  const result = spawnSync(process.execPath, [fileURLToPath(new URL('../scripts/build-monthly-batch.mjs', import.meta.url)), '--input', input, '--output', output], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /explicitly complete/);
  assert.equal(await readFile(output, 'utf8'), 'last good monthly report');
});

function fakeGithub(existing = []) {
  const calls = { create: [], update: [] };
  return {
    calls,
    paginate: async () => existing,
    rest: {
      issues: {
        listForRepo: async () => ({ data: existing }),
        create: async (args) => { calls.create.push(args); return { data: { number: 7 } }; },
        update: async (args) => { calls.update.push(args); return { data: { number: args.issue_number } }; },
      },
    },
  };
}

test('discovery issue upsert is idempotent and never creates a daily duplicate', async () => {
  const marker = '<!-- stable-discovery -->';
  const github = fakeGithub();
  const created = await upsertDiscoveryIssue({ github, owner: 'o', repo: 'r', title: 'Discovery', marker, body: 'report' });
  assert.deepEqual(created, { action: 'created', issueNumber: 7 });
  assert.equal(github.calls.create.length, 1);

  const body = `${marker}\nreport`;
  const unchangedGithub = fakeGithub([{ number: 7, title: 'Discovery', body, state: 'open' }]);
  const unchanged = await upsertDiscoveryIssue({ github: unchangedGithub, owner: 'o', repo: 'r', title: 'Discovery', marker, body: 'report' });
  assert.deepEqual(unchanged, { action: 'unchanged', issueNumber: 7 });
  assert.equal(unchangedGithub.calls.create.length, 0);
  assert.equal(unchangedGithub.calls.update.length, 0);

  const updateGithub = fakeGithub([{ number: 7, title: 'Discovery', body: `${marker}\nold`, state: 'closed' }]);
  const updated = await upsertDiscoveryIssue({ github: updateGithub, owner: 'o', repo: 'r', title: 'Discovery', marker, body: 'new' });
  assert.deepEqual(updated, { action: 'updated', issueNumber: 7 });
  assert.equal(updateGithub.calls.update[0].state, 'open');
});

test('discovery workflow only emits artifacts and idempotent issues', async () => {
  const workflow = await readFile(new URL('../.github/workflows/discovery.yml', import.meta.url), 'utf8');
  assert.match(workflow, /contents: read/);
  assert.match(workflow, /issues: write/);
  assert.match(workflow, /--updated-since/);
  assert.match(workflow, /--probe --max-probes 25/);
  assert.match(workflow, /--allow-partial/);
  assert.match(workflow, /source\.complete/);
  assert.equal((workflow.match(/if: steps\.completeness\.outputs\.complete == 'true'/g) ?? []).length, 3);
  assert.match(workflow, /--size 10/);
  assert.match(workflow, /dsh-data-mcp-discovery-daily/);
  assert.match(workflow, /dsh-data-mcp-discovery-monthly/);
  assert.doesNotMatch(workflow, /git push|pulls\.create|connectors\//);
});
