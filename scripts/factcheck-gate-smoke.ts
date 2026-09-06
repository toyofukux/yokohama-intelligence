import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cp, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

// Test actual entry points in a disposable checkout, never mutate the working tree.
const dir = await mkdtemp(join(tmpdir(), 'yokohama-gate-'));
try {
  for (const path of ['package.json', 'pnpm-lock.yaml', 'packages', 'scripts', 'data', 'apps']) {
    await cp(resolve(path), join(dir, path), {
      recursive: true,
      filter: (p) => !p.includes('/.wrangler') && !p.includes('/node_modules'),
    });
  }
  await symlink(resolve('node_modules'), join(dir, 'node_modules'), 'dir');
  await rm(join(dir, 'data/editorial/raw'), { recursive: true, force: true });
  const clean = spawnSync('pnpm', ['factcheck:check'], {
    cwd: dir,
    encoding: 'utf8',
    timeout: 60_000,
  });
  assert.equal(clean.error, undefined);
  assert.equal(clean.status, 0, clean.stdout + clean.stderr);
  console.log(
    'Clean checkout restored pinned originals and verified the release without AI credentials.',
  );
  const path = join(dir, 'data/editorial/issues.json');
  const original = await readFile(path, 'utf8');
  const issues = JSON.parse(original);
  issues[0].summary += '未検証の追記。';
  await writeFile(path, JSON.stringify(issues));
  for (const args of [
    ['factcheck:check'],
    ['exec', 'astro', 'build', '--root', 'apps/web'],
    ['exec', 'wrangler', 'deploy', '--config', 'apps/mcp/wrangler.jsonc', '--dry-run'],
  ]) {
    const result = spawnSync('pnpm', args, { cwd: dir, encoding: 'utf8', timeout: 60_000 });
    assert.equal(result.error, undefined);
    assert.notEqual(result.status, 0, `Unreviewed content passed: ${args.join(' ')}`);
    assert.match(
      result.stdout + result.stderr,
      /Review is stale/,
      'Must fail at the editorial gate, not an unrelated environment error',
    );
    console.log(`Unreviewed edit blocked: ${args.join(' ')}`);
  }
  await writeFile(path, original);
  const sources = JSON.parse(await readFile(join(dir, 'data/editorial/evidence.json'), 'utf8'));
  const raw = join(dir, sources.find((s: { artifact: unknown }) => s.artifact).artifact.path);
  await writeFile(raw, `${await readFile(raw, 'utf8')}\n<!-- tampered -->`);
  const corrupt = spawnSync('pnpm', ['factcheck:check'], {
    cwd: dir,
    encoding: 'utf8',
    timeout: 60_000,
  });
  assert.equal(corrupt.error, undefined);
  assert.notEqual(corrupt.status, 0);
  assert.match(corrupt.stdout + corrupt.stderr, /Evidence differs from the immutable original/);
  console.log('Tampered original evidence blocked.');
} finally {
  await rm(dir, { recursive: true, force: true });
}
