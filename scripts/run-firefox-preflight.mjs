#!/usr/bin/env node
import { access, mkdtemp, readFile, realpath, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { pathToFileURL } from 'node:url';
import { runStdioPreflight } from './run-stdio-preflight.mjs';

export const FIREFOX_MCP_VERSION = '0.10.6';

// No arbitrary URL, existing-profile, environment or tool overrides: this is an
// acceptance fixture, not a general browser launcher or an OS security sandbox.
export function firefoxFixtureArgs({ entry, firefoxPath, directory, fixtureUrl }) {
  return [entry, '--headless', '--firefox-path', firefoxPath,
    '--profile-path', join(directory, 'profile'), '--tools', 'pages',
    '--start-url', fixtureUrl, '--output-file', join(directory, 'firefox.log')];
}

export async function runFirefoxPreflight({ packageRoot, firefoxPath }) {
  if (!packageRoot || !firefoxPath) throw new Error('--package-root and --firefox-path are required');
  const root = await realpath(resolve(packageRoot));
  const metadata = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
  if (metadata.name !== '@mozilla/firefox-devtools-mcp' || metadata.version !== FIREFOX_MCP_VERSION) {
    throw new Error(`Requires official @mozilla/firefox-devtools-mcp@${FIREFOX_MCP_VERSION}`);
  }
  const binary = typeof metadata.bin === 'string' ? metadata.bin : metadata.bin?.['firefox-devtools-mcp'];
  if (!binary) throw new Error('Official package has no firefox-devtools-mcp entry');
  const entry = await realpath(resolve(root, binary));
  if (!entry.startsWith(`${root}/`)) throw new Error('Package entry must remain inside the package');
  const firefox = await realpath(resolve(firefoxPath));
  await access(firefox, constants.X_OK);
  const directory = await mkdtemp(join(tmpdir(), 'registry-firefox-fixture-'));
  const marker = 'Registry Firefox isolated acceptance fixture';
  const server = createServer((_request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy': "default-src 'none'", 'Cache-Control': 'no-store' });
    response.end(`<!doctype html><html><head><title>Registry fixture</title></head><body><h1>${marker}</h1><p>Synthetic content only.</p></body></html>`);
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const fixtureUrl = `http://127.0.0.1:${server.address().port}/`;
    const report = await runStdioPreflight({
      command: process.execPath,
      args: firefoxFixtureArgs({ entry, firefoxPath: firefox, directory, fixtureUrl }),
      cwd: directory, label: `firefox-devtools-mcp@${FIREFOX_MCP_VERSION}`,
      reviewer: 'Codex automated isolated fixture (not human approval)',
      timeoutMs: 120_000, tool: 'get_page_text', toolArgs: { maxLength: 2000 },
      expectedText: marker,
    });
    return { ...report, fixture: {
      target: 'loopback synthetic HTML (ephemeral port)', freshProfile: true, toolModule: 'pages',
      reusedPersonalProfile: false, dshDesktopUiVerified: false,
      humanApproval: 'pending',
    } };
  } finally {
    server.closeAllConnections();
    await new Promise((done) => server.close(done));
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const options = {};
  const names = { '--package-root': 'packageRoot', '--firefox-path': 'firefoxPath', '--output': 'output' };
  try {
    for (let index = 2; index < process.argv.length; index += 2) {
      const name = names[process.argv[index]];
      const value = process.argv[index + 1];
      if (!name || !value || value.startsWith('--')) throw new Error('Invalid or missing argument');
      options[name] = value;
    }
    const report = await runFirefoxPreflight(options);
    if (options.output) await writeFile(resolve(options.output), `${JSON.stringify(report, null, 2)}\n`, { flag: 'wx' });
    else console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    console.error(`Firefox preflight failed: ${error.message}`);
    process.exitCode = 1;
  }
}
