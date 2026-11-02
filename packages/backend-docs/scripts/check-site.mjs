import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const args = process.argv.slice(2);
const flag = (name) => args.indexOf(name);
const root = flag('--root') >= 0 ? resolve(args[flag('--root') + 1]) : join(import.meta.dirname, '..');
const base = flag('--base') >= 0 ? args[flag('--base') + 1].replace(/\/$/, '') : '';
const baselineFile = join(root, 'scripts', 'anchors-baseline.json');
const errors = [];

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]
  );

const htmlDir = join(root, base ? 'out' : '.next/server/app');
if (!existsSync(htmlDir)) {
  console.error(`${relative(root, htmlDir)} not found: build the site first`);
  process.exit(1);
}

// route -> ids on that page, minus React's generated useId values (unstable between builds)
const pages = new Map();
for (const file of walk(htmlDir)) {
  const rel = relative(htmlDir, file).replaceAll('\\', '/');
  const match = base ? rel.match(/^(.*?)\/?index\.html$/) : rel.match(/^(.*)\.html$/);
  if (!match || rel.startsWith('_')) continue;
  const route = ('/' + match[1]).replace(/\/index$/, '').replace(/^\/$/, '') || '/';
  const html = readFileSync(file, 'utf8');
  // Framework error pages have no authored MDX body or stable content anchors.
  if (!html.includes('data-pagefind-body')) continue;
  pages.set(route, { html, ids: new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]).filter((id) => !id.includes('_R_'))) });
}

const decode = (s) => s.replaceAll('&amp;', '&');
if (!pages.size) errors.push('No documentation pages found; check the build mode and --base.');
const assetPath = (path) => /^\/_|\.\w+$/.test(path.replace(/\/$/, ''));
// The docs hub and sibling site intentionally leave this Nextra application's base path.
const crossSiteHrefs = new Set(['/documentation', '/documentation/frontend', '/documentation/backend']);

for (const [route, { html }] of pages) {
  for (const m of html.matchAll(/\shref="([^"]*)"/g)) {
    const href = decode(m[1]);
    if ((!href.startsWith('/') && !href.startsWith('#')) || href.startsWith('//')) continue;
    if (base && !href.startsWith('#') && href !== base && !href.startsWith(base + '/') && !href.startsWith(base + '#')) {
      if (!crossSiteHrefs.has(href)) errors.push(`${route}: link to ${href} lacks the base ${base}`);
      continue;
    }
    const [pathAndQuery, fragment] = (href.startsWith('#') ? route + href : href.slice(base.length)).split('#');
    const path = (pathAndQuery.split('?')[0] || '/').replace(/(.)\/$/, '$1');
    if (assetPath(path)) continue;
    const target = pages.get(path);
    if (!target) errors.push(`${route}: link to ${href} has no built page`);
    else if (fragment && !target.ids.has(decodeURIComponent(fragment)))
      errors.push(`${route}: link to ${href} has no id="${fragment}" on ${path}`);
  }
}

const metaKeys = (source) => {
  const keys = [];
  let depth = 0;
  for (const line of source.replace(/\/\/.*$/gm, '').split('\n')) {
    const key = depth === 1 && line.match(/^\s*(?:'([^']+)'|"([^"]+)"|([\w$-]+))\s*:\s*(\S?)/);
    // object-valued entries (separators, menus, links) have no file of their own
    if (key && key[4] !== '{') keys.push(key[1] ?? key[2] ?? key[3]);
    const bare = line.replace(/(['"`]).*?\1/g, '');
    depth += (bare.match(/{/g) ?? []).length - (bare.match(/}/g) ?? []).length;
  }
  return keys.filter((k) => k !== '*');
};

const contentDir = join(root, 'content');
const checkMeta = (dir) => {
  const entries = readdirSync(dir, { withFileTypes: true });
  const here = relative(root, dir).replaceAll('\\', '/');
  const files = entries.filter((e) => e.isFile() && e.name.endsWith('.mdx')).map((e) => e.name.slice(0, -4));
  const folders = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  const metaPath = join(dir, '_meta.ts');
  if (!existsSync(metaPath)) errors.push(`${here}: _meta.ts missing`);
  else {
    const keys = metaKeys(readFileSync(metaPath, 'utf8'));
    for (const name of [...files, ...folders])
      if (!keys.includes(name)) errors.push(`${here}/_meta.ts: no key for ${name}`);
    for (const key of keys)
      if (!files.includes(key) && !folders.includes(key)) errors.push(`${here}/_meta.ts: key ${key} has no file or folder`);
  }
  folders.forEach((f) => checkMeta(join(dir, f)));
};
checkMeta(contentDir);

for (const file of walk(contentDir).filter((file) => file.endsWith('.mdx'))) {
  const source = readFileSync(file, 'utf8');
  const images = [
    ...source.matchAll(/\bfrom\s+['"]([^'"]+\.(?:svg|png|jpe?g|webp|gif))['"]/g),
    ...source.matchAll(/!\[[^\]]*\]\(([^\s)]+)(?:\s+[^)]*)?\)/g),
    ...source.matchAll(/\bsrc=['"]([^'"]+)['"]/g)
  ];
  for (const [, image] of images) {
    if (/^(?:https?:|data:|\/\/)/.test(image)) continue;
    const path = image.split(/[?#]/)[0];
    const target = path.startsWith('/') ? join(root, 'public', path) : resolve(dirname(file), path);
    if (!existsSync(target)) errors.push(`${relative(root, file)}: image ${image} does not exist`);
  }
}

const current = [...pages].flatMap(([route, { ids }]) => [...ids].map((id) => `${route}#${id}`)).sort();

if (flag('--write-baseline') >= 0) {
  mkdirSync(dirname(baselineFile), { recursive: true });
  writeFileSync(baselineFile, JSON.stringify(current, null, 2) + '\n');
  console.log(`baseline: ${current.length} route#anchor pairs written`);
} else if (existsSync(baselineFile)) {
  const present = new Set(current);
  for (const pair of JSON.parse(readFileSync(baselineFile, 'utf8')))
    if (!present.has(pair)) errors.push(`baseline anchor ${pair} no longer resolves`);
}

errors.forEach((e) => console.error(e));
console.log(errors.length ? `FAIL: ${errors.length} error(s)` : `OK: ${pages.size} pages checked`);
process.exit(errors.length ? 1 : 0);
