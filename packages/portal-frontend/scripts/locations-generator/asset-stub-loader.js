/**
 * Node.js ESM loader that stubs out non-JS asset imports (SVG, CSS, PNG, etc.)
 * Usage: node --loader ./scripts/asset-stub-loader.mjs --loader tsx/esm <file>
 */

const ASSET_RE =
  /\.(svg|png|jpg|jpeg|gif|webp|ico|css|scss|sass|less|ttf|woff|woff2|eot)(\?.*)?$/

// Match src paths that are pure UI and should never run in Node.js
const UI_PATH_RE =
  /[/\\]src[/\\](components|providers|features|hooks|app|pages|i18n|styles|services[/\\]Map)[/\\]/

// UI packages that should return empty stubs
const UI_PKG_RE =
  /node_modules[/\\](recharts|d3-|d3\/|@nivo|framer-motion|react-spring|mapbox-gl)/

// Source files that use browser-only APIs and must be stubbed during generation
const GENERATOR_STUB_RE = /[/\\]services[/\\]LocationsTree[/\\]fetchers\./

// `d3-geo` and its `d3-array` dependency match the `d3-` UI rule below, but they
// are real geo/math used by `@turf` (needed during generation), not charting
// deps — never stub them.
const KEEP_RE = /node_modules[/\\]d3-(geo|array)[/\\]/

function isStub(url) {
  if (KEEP_RE.test(url)) return false
  return (
    url.startsWith('asset-stub:') ||
    ASSET_RE.test(url) ||
    UI_PATH_RE.test(url) ||
    UI_PKG_RE.test(url) ||
    GENERATOR_STUB_RE.test(url)
  )
}

export function resolve(specifier, context, nextResolve) {
  if (ASSET_RE.test(specifier)) {
    return { shortCircuit: true, url: 'asset-stub:' + specifier }
  }
  return nextResolve(specifier, context)
}

export function load(url, context, nextLoad) {
  if (isStub(url)) {
    return {
      shortCircuit: true,
      format: 'module',
      source: 'export default null; export {}'
    }
  }
  return nextLoad(url, context)
}
