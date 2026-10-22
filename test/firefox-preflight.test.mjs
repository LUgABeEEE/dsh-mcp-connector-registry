import assert from 'node:assert/strict';
import test from 'node:test';
import { firefoxFixtureArgs, runFirefoxPreflight } from '../scripts/run-firefox-preflight.mjs';

test('Firefox fixture uses an explicit isolated profile, fixture target and minimal module', () => {
  const args = firefoxFixtureArgs({ entry: '/package/index.js', firefoxPath: '/bin/firefox', directory: '/tmp/test-fixture', fixtureUrl: 'http://127.0.0.1:12345/' });
  assert.deepEqual(args, ['/package/index.js', '--headless', '--firefox-path', '/bin/firefox',
    '--profile-path', '/tmp/test-fixture/profile', '--tools', 'pages',
    '--start-url', 'http://127.0.0.1:12345/', '--output-file', '/tmp/test-fixture/firefox.log']);
  for (const flag of ['--connect-existing', '--auto-profile', '--accept-insecure-certs', '--unrestricted-save-paths']) {
    assert.equal(args.includes(flag), false);
  }
});

test('Firefox fixture requires explicit prerequisites; never downloads a browser implicitly', async () => {
  await assert.rejects(runFirefoxPreflight({}), /required/);
});
