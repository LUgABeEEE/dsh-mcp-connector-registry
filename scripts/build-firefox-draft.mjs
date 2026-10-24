import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export async function firefoxNpxArgs() {
  const bootstrap = await readFile(new URL('./firefox-npx-bootstrap.cjs', import.meta.url), 'utf8');
  return ['-y', '--package=@mozilla/firefox-devtools-mcp@0.10.6', 'node', '-e',
    `${bootstrap}\nrun().catch(error => { console.error(error.message); process.exitCode = 1; });`,
    '--', '--headless', '--no-auto-profile', '--no-connect-existing', '--tools', 'pages', '--start-url', 'about:blank'];
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  // Keep the historical filename and exact bootstrap bytes for report reproducibility.
  const target = new URL('../connectors/firefox-devtools.json', import.meta.url);
  const descriptor = JSON.parse(await readFile(target, 'utf8'));
  descriptor.servers[0].args = await firefoxNpxArgs();
  await writeFile(target, `${JSON.stringify(descriptor, null, 2)}\n`);
}
