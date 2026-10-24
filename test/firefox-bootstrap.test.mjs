import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, symlink, rm, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, delimiter } from 'node:path';
import test from 'node:test';
import bootstrap from '../scripts/firefox-npx-bootstrap.cjs';

async function fixture(t, version = '0.10.6') {
  const root = await mkdtemp(join(tmpdir(), 'firefox-bootstrap-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const modules = join(root, 'node_modules');
  const bin = join(modules, '.bin');
  const pkg = join(modules, '@mozilla', 'firefox-devtools-mcp');
  await mkdir(bin, { recursive: true });
  await mkdir(join(pkg, 'dist'), { recursive: true });
  await writeFile(join(pkg, 'package.json'), JSON.stringify({name:'@mozilla/firefox-devtools-mcp', version}));
  await writeFile(join(pkg, 'dist/index.js'), '// inert fixture');
  return { root, bin, pkg };
}

test('npx bootstrap omits only npm geckodriver shim directories and preserves caller env', async t => {
  const { bin, pkg } = await fixture(t);
  await writeFile(join(bin, 'geckodriver'), '// inert shim');
  const env = { PATH: [bin, '/usr/local/bin', '/usr/bin'].join(delimiter), SAFE: 'unchanged' };
  const before = structuredClone(env);
  const launch = bootstrap.resolveLaunch(env);
  assert.equal(launch.entry, await realpath(join(pkg, 'dist/index.js')));
  assert.equal(launch.value, ['/usr/local/bin', '/usr/bin'].join(delimiter));
  assert.deepEqual(env, before);
});

test('bootstrap keeps npm bin without geckodriver and recognizes Windows PATH spelling and shim', async t => {
  const { bin } = await fixture(t);
  assert.equal(bootstrap.resolveLaunch({PATH:bin}).value, bin);
  await writeFile(join(bin, 'geckodriver.cmd'), 'inert');
  const launch = bootstrap.resolveLaunch({Path:`${bin};C:\\Windows`}, 'win32');
  assert.equal(launch.pathKey, 'Path');
  assert.equal(launch.value, 'C:\\Windows');
});

test('bootstrap fails closed for unpinned or missing official package', async t => {
  const {bin} = await fixture(t, '9.9.9');
  assert.throws(() => bootstrap.resolveLaunch({PATH:bin}), /requires official package version/);
  assert.throws(() => bootstrap.resolveLaunch({PATH:'/usr/bin'}), /not found/);
});

test('bootstrap rejects entry symlink escaping pinned package', async t => {
  const {bin,pkg,root} = await fixture(t);
  await writeFile(join(root,'outside.js'), '// inert');
  await rm(join(pkg,'dist/index.js'));
  await symlink(join(root,'outside.js'), join(pkg,'dist/index.js'));
  assert.throws(() => bootstrap.resolveLaunch({PATH:bin}), /escapes package root/);
});
