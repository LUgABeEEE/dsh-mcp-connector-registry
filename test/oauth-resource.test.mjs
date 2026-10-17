import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const root = dirname(require.resolve('dsh-mcp-connector/package.json'));
const { normalizeConnectorDescriptor } = await import(pathToFileURL(join(root, 'lib/schema.js')));
const schema = JSON.parse(await readFile(new URL('../schema/connector.schema.json', import.meta.url), 'utf8'));

test('published validator preserves canonical OAuth resource separately from tool-selection URL', () => {
  const url = 'https://mcp.example.com/mcp?tools=search,research';
  const oauthResource = 'https://mcp.example.com/mcp';
  const result = normalizeConnectorDescriptor({
    schemaVersion: 1, id: 'oauth-resource-test', name: 'OAuth resource test',
    auth: { mode: 'oauth2-pkce' },
    servers: [{ serverKey: 'main', serverName: 'oauth-resource-test', transport: 'streamable-http', url, oauthResource }],
  });
  assert.equal(result.servers[0].url, url);
  assert.equal(result.servers[0].oauthResource, oauthResource);
});

test('JSON Schema declares oauthResource and contributor check permits regenerated products', async () => {
  assert.equal(schema.properties.servers.items.properties.oauthResource.type, 'string');
  assert.equal(schema.properties.servers.items.properties.oauthResource.minLength, 1);
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  assert.doesNotMatch(pkg.scripts.check, /git diff/);
});
