import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

const root = 'apps/web/dist';
async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((e) =>
        e.isDirectory() ? walk(join(dir, e.name)) : Promise.resolve([join(dir, e.name)]),
      ),
    )
  ).flat();
}
const files = (await walk(root)).filter((p) => p.endsWith('.html'));
let count = 0;
for (const file of files) {
  const html = await readFile(file, 'utf8');
  for (const match of html.matchAll(/href="(\/[^"\s]*)"/g)) {
    const url = new URL(match[1].replaceAll('&amp;', '&'), 'https://local.invalid');
    const path = join(
      root,
      url.pathname.endsWith('/') ? `${url.pathname}index.html` : url.pathname,
    );
    assert.ok((await stat(path)).isFile(), `Missing internal target: ${path}`);
    if (url.hash) {
      const target = await readFile(path, 'utf8');
      assert.ok(target.includes(`id="${url.hash.slice(1)}"`), `Missing anchor: ${match[1]}`);
    }
    count++;
  }
}
console.log(`Verified ${count} internal links and anchors across ${files.length} HTML pages.`);
