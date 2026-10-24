// First-party compatibility bootstrap, not Mozilla code. Serialized into the
// unpublished descriptor by build-firefox-draft.mjs; no download or shell eval.
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

function resolveLaunch(env, platform = process.platform) {
  const pathKey = Object.keys(env).find(key => key.toUpperCase() === 'PATH') || 'PATH';
  const separator = platform === 'win32' ? ';' : ':';
  const dirs = (env[pathKey] || '').split(separator).filter(Boolean);
  let entry;
  const filtered = dirs.filter(dir => {
    if (path.basename(dir) !== '.bin' || path.basename(path.dirname(dir)) !== 'node_modules') return true;
    const modules = path.dirname(dir);
    const manifest = path.join(modules, '@mozilla', 'firefox-devtools-mcp', 'package.json');
    if (fs.existsSync(manifest)) {
      const metadata = JSON.parse(fs.readFileSync(manifest, 'utf8'));
      if (metadata.name !== '@mozilla/firefox-devtools-mcp' || metadata.version !== '0.10.6') {
        throw new Error('Firefox bootstrap requires official package version 0.10.6');
      }
      const root = fs.realpathSync(path.dirname(manifest));
      const candidate = fs.realpathSync(path.join(root, 'dist', 'index.js'));
      if (!candidate.startsWith(root + path.sep)) throw new Error('Firefox entry escapes package root');
      entry ||= candidate;
    }
    // Only omit npm binary-shim directories with geckodriver in this child
    // process. Keep ordinary OS driver directories and never change user PATH.
    return !['geckodriver', 'geckodriver.cmd', 'geckodriver.ps1']
      .some(name => fs.existsSync(path.join(dir, name)));
  });
  if (!entry) throw new Error('Pinned Firefox package was not found in npm executable PATH');
  return { entry, pathKey, value: filtered.join(separator) };
}

async function run() {
  const launch = resolveLaunch(process.env);
  process.env[launch.pathKey] = launch.value;
  process.argv = [process.execPath, launch.entry, ...process.argv.slice(1)];
  await import(pathToFileURL(launch.entry).href);
}

module.exports = { resolveLaunch, run };
