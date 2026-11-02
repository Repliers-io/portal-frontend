import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { test } from 'node:test';

const checker = join(import.meta.dirname, 'check-site.mjs');
const fixture = (t, base = '') => {
  const root = mkdtempSync(join(tmpdir(), 'portal-docs-check-'));
  t.after(() => {
    assert.equal(dirname(resolve(root)), resolve(tmpdir()));
    rmSync(root, { recursive: true });
  });
  const put = (path, content) => {
    const file = join(root, path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, content);
  };
  put('content/_meta.ts', "export default {\n index: 'Home'\n}\n");
  put('content/index.mdx', '# Home\n');
  const output = base ? 'out/index.html' : '.next/server/app/index.html';
  put(output, '<main data-pagefind-body id="home"><a href="#home">Home</a></main>');
  const run = (...args) => spawnSync(process.execPath,
    [checker, '--root', root, ...(base ? ['--base', base] : []), ...args],
    { encoding: 'utf8' });
  return { put, output, run };
};

test('preserves original anchors and rejects a removed anchor', (t) => {
  const { put, output, run } = fixture(t);
  assert.equal(run('--write-baseline').status, 0);
  put(output, '<main data-pagefind-body id="renamed"></main>');
  const result = run();
  assert.equal(result.status, 1);
  assert.match(result.stderr, /baseline anchor \/#home no longer resolves/);
});

test('checks local hash links, navigation and imported images', (t) => {
  const { put, output, run } = fixture(t);
  put(output, '<main data-pagefind-body><a href="#missing">Missing</a></main>');
  put('content/index.mdx', "import image from '../public/missing.webp'\n# Home\n");
  put('content/extra.mdx', '# Extra\n');
  const result = run();
  assert.equal(result.status, 1);
  assert.match(result.stderr, /no id="missing"/);
  assert.match(result.stderr, /no key for extra/);
  assert.match(result.stderr, /image .*missing.webp does not exist/);
});

test('resolves static base paths, permits peer navigation and ignores framework errors', (t) => {
  const base = '/documentation/frontend';
  const { put, output, run } = fixture(t, base);
  put(output, `<main data-pagefind-body id="home"><a href="${base}/#home">Home</a><a href="/documentation/backend">Backend</a></main>`);
  put('out/404.html', '<a href="#nextra-skip-nav">Skip</a>');
  assert.equal(run().status, 0);
  put(output, '<main data-pagefind-body><a href="/missing">Missing</a></main>');
  assert.match(run().stderr, /lacks the base/);
});
