import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { runStdioPreflight } from '../scripts/run-stdio-preflight.mjs';

test('stdio preflight records initialize and tools/list without a tool call', async () => {
  const fixture = fileURLToPath(new URL('../fixtures/stdio-server.mjs', import.meta.url));
  const report = await runStdioPreflight({
    command: process.execPath,
    args: [fixture],
    label: 'fixture',
    reviewer: 'test-reviewer',
    timeoutMs: 5_000,
  });
  assert.equal(report.decision, 'pass');
  assert.equal(report.serverInfo.name, 'fixture-server');
  assert.equal(report.tools.length, 1);
  assert.deepEqual(report.tools[0], {
    name: 'fixture_read',
    title: null,
    readOnlyHint: true,
    destructiveHint: false,
  });
  assert.equal(report.processOutput.nonProtocolStdoutBytes, 0);
  assert.match(report.notes, /No tools\/call/);
});

test('stdio preflight can hash a selected non-secret tool result without retaining content', async () => {
  const fixture = fileURLToPath(new URL('../fixtures/stdio-server.mjs', import.meta.url));
  const report = await runStdioPreflight({
    command: process.execPath,
    args: [fixture],
    label: 'fixture-call',
    reviewer: 'test-reviewer',
    timeoutMs: 5_000,
    tool: 'fixture_read',
    toolArgs: {},
    expectedText: 'fixture-result',
  });
  assert.equal(report.decision, 'pass');
  assert.deepEqual(report.call.contentTypes, ['text']);
  assert.equal(report.call.status, 'success');
  assert.equal(report.call.credentialScan.status, 'pass');
  assert.equal('content' in report.call, false);
  assert.equal(report.call.contentAssertion.status, 'pass');
  assert.equal(report.call.textCharacters, 14);
  assert.match(report.call.responseSha256, /^[a-f0-9]{64}$/);
});

for (const flag of ['--missing-annotations', '--write-tool', '--destructive-tool']) {
  test(`stdio preflight blocks unsafe tool annotations: ${flag}`, async () => {
    await assert.rejects(runStdioPreflight({
      command: process.execPath,
      args: [fileURLToPath(new URL('../fixtures/stdio-server.mjs', import.meta.url)), flag],
      tool: 'fixture_read', timeoutMs: 5_000,
    }), /explicitly declare readOnlyHint/);
  });
}

test('stdio preflight fails a successful but semantically wrong fixture response', async () => {
  await assert.rejects(runStdioPreflight({
    command: process.execPath,
    args: [fileURLToPath(new URL('../fixtures/stdio-server.mjs', import.meta.url))],
    tool: 'fixture_read', expectedText: 'missing fixture text', timeoutMs: 5_000,
  }), /expected public fixture text/);
});

test('stdio preflight validates cwd before spawning', async () => {
  await assert.rejects(runStdioPreflight({ command: process.execPath, cwd: '.' }), /absolute path/);
});

test('stdio preflight rejects credential-shaped process output', async () => {
  const fixture = fileURLToPath(new URL('../fixtures/stdio-server.mjs', import.meta.url));
  await assert.rejects(
    runStdioPreflight({
      command: process.execPath,
      args: [fixture, '--emit-secret'],
      label: 'fixture-secret',
      reviewer: 'test-reviewer',
      timeoutMs: 5_000,
    }),
    /process output contained credential-shaped content/,
  );
});
