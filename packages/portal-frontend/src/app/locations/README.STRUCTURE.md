# Locations Structure

## Architecture Overview

Location pages use a **pre-generated static JSON** file instead of building the
locations tree at runtime. The generator runs offline (or in CI) and writes the
result to `public/{instance}/locations.json`. At request time the app simply
reads that file.

```
┌──────────────────────────────────────┐
│  scripts/locations-generator/        │  ← runs offline / in CI
│    index.js        (CLI wrapper)     │
│    entry.ts        (generator logic) │
│    asset-stub-loader.js              │
│    register-asset-stub.js            │
└──────────────┬───────────────────────┘
               │ pnpm generate:locations [instance]
               ▼
        public/{instance}/locations.json
               │
               ▼
┌──────────────────────────────────────┐
│  services/LocationsTree/static.ts    │  ← loadStaticTree()
│    reads JSON, returns TreeResult    │
└──────────────┬───────────────────────┘
               │
               ▼
      app/locations/**/page.tsx
```

## Folder Structure

```
app/locations/
├── [[...slugs]]/              # Main locations index page
│   ├── page.tsx               # generateStaticParams + page component
│   └── _utils/
│       ├── helpers.ts         # fetchLocationsData() — reads static tree
│       ├── parsers.ts         # URL slug → { area, city, hood }
│       ├── requests.ts        # Listings API requests
│       ├── constants.ts       # Page constants
│       ├── utils.ts           # General utilities
│       └── index.ts           # Exports
├── buildings/[[...slugs]]/    # Buildings index page
│   └── page.tsx
├── building/[...slugs]/       # Single building page
│   └── page.tsx
├── debug/                     # Tree visualizer (dev-only, hits API at runtime)
│   ├── page.tsx
│   └── _utils/
│       ├── html.ts
│       ├── stats.ts
│       └── index.ts
├── _sitemap.ts                # Sitemap generation
├── types.ts
└── README.STRUCTURE.md
```

## Generating the locations.json

```bash
# Generate for a specific instance
pnpm generate:locations urbn

# Generate for the default instance (.env)
pnpm generate:locations
```

The script lives in `scripts/locations-generator/` (monorepo root level).
It calls `buildProductionTree` using tsx + Node.js ESM loaders, applying full
deduplication, count fetching, trash filtering and sorting, then serialises the
result to `public/{instance}/locations.json`.

**Output structure:**

```json
{
  "createdAt": "2026-08-27T13:58:02.457Z",
  "source": "UserDefined",
  "metadata": { "requestCount": 5390, "retriedCount": 0, "failedCount": 0 },
  "stats": { },
  "tree": { "areas": [ { "i": "...", "n": "Toronto Area", "s": [ ... ] } ] }
}
```

The file is machine-only — written by a generator, read by `loadStaticTree`, never
by a human and never by the browser — so it stores a compact node:

```json
{ "i": "UDLCAONNBDJNIKIKB", "n": "Leslieville", "c": 5, "p": [43.6626, -79.3306] }
```

`i` locationId, `n` name, `c` activeCount, `p` centre `[lat, lng]` at 5 decimals
(≈1 m), `s` children — cities under an area, neighbourhoods under a city, the
level implied by depth. `source` sits in the header rather than on every node:
it belongs to the query, not to a location, and all of them come from one.

`expandTree` (`services/LocationsTree/cache.ts`) turns a node back into the
`ApiLocation` shape on read, so runtime code keeps its usual field names. Both
writers — `pnpm generate:locations` and `/api/generateLocations` — assemble the
file with `toCacheFile` from that same module; writing it by hand in either place
is how the two drifted apart before.

Short keys, no indentation, 5-decimal coordinates and no dead fields
(`source` moved to the header, `address` dropped — nothing reads either off a
cached node) cut the urbn tree from **961 KB to 224 KB**.

**Coordinates are in, boundaries are out.** The centre point removes the two
nearby-location lookups and the per-child cluster fallback (one `/search` per
child without coordinates, up to `maxSeoHoods` of them on a city page). Polygons
stay out of the file: a page draws the polygon of exactly one location, and child
polygons for hover highlighting arrive in a single batch request. That leaves a
city page with two API calls for geometry instead of four plus one per child.

A node the generator could not place carries no `p`, and nothing recovers it at
runtime: it simply never appears among nearby locations.

## Reading the tree at runtime

```typescript
import { loadStaticTree } from 'services/LocationsTree'

// async — reads public/{instance}/locations.json via fs/promises
const { tree, countsMap, metadata, stats } = await loadStaticTree()
```

`loadStaticTree` is defined in `services/LocationsTree/static.ts` and is
**server-only** (uses `fs/promises`). The webpack config has `fs: false`
fallback so it is safely excluded from client bundles.

## fetchLocationsData helper

`[[...slugs]]/_utils/helpers.ts` wraps `loadStaticTree` and extracts
page-relevant slices from the tree based on the current URL params:

```typescript
const { areas, cities, hoods, currentLocation } = await fetchLocationsData({
  area, // e.g. "ontario"
  city, // e.g. "toronto"
  hood // e.g. "annex"
})
```

Internally it uses `extractCities`, `extractNeighborhoods`, `findCityByName`
and `locationMatchKey` from `services/LocationsTree/filters.ts`. All
counts come directly from `activeCount` on tree nodes — no secondary mapping.

## Filtering utilities (services/LocationsTree/filters.ts)

- `locationMatchKey()` — lowercase, strip `-area`, collapse whitespace (match-key for comparing names; NOT for URLs — use `sanitizeUrl`)
- `findAreaByName()`, `findCityByName()` — look up a node by normalised name
- `extractCities()`, `extractNeighborhoods()` — extract sub-trees
- `filterDuplicates()`, `filterTrashLocations()` — post-load filtering
- `resolveLocation()` — URL names → tree nodes. Also answers the **city position with
  an area** (`/on/toronto`, where the board files Toronto as an area over North York and
  Scarborough): only when no city carries the name and the URL names no neighbourhood.
- `areaOwnsShortUrl()`, `getAreaUrl()` — an area is canonical at its short URL
  (`/on/toronto`, not `/on/toronto-area`) unless a city shares the name. Used by the
  canonical tag, the sitemap and `generateStaticParams`; in-app links keep the marker,
  which `/condos`, `/condo` and building breadcrumbs still parse.

To let a city and a neighbourhood follow that short form — `/on/toronto/north-york` —
the area must be listed in `@configs/location` → `cityPositionAreas`. The parser has no
tree, so this is the one part it cannot derive.

## Debug page

`/locations/debug` still calls `LocationsTree.buildTree()` **at request time**
so developers can inspect the live tree with query-param toggles
(`?checkAll=true&hideTrash=true&sortByCount=true`). It is not used in
production rendering.

## Benefits of the static approach

|                                 | Old (runtime)                | New (static JSON)                   |
| ------------------------------- | ---------------------------- | ----------------------------------- |
| API calls per page request      | many (counts for every node) | zero                                |
| Cold-start latency              | high                         | none                                |
| Stale data risk                 | none                         | until next `generate:locations` run |
| Can run without API credentials | no                           | yes                                 |
| CI/deploy artifact              | no                           | `public/{instance}/locations.json`  |

│ ├── tree-filters.ts # Filtering and extraction utilities
│ └── index.ts # Exports
├── [[...slugs]]/ # Main locations page
│ ├── page.tsx # Page component
│ └── \_utils/ # Page-specific utilities
│ ├── helpers.ts # Tree data fetching logic
│ ├── parsers.ts # URL parameter parsing
│ ├── requests.ts # Listings API requests
│ ├── constants.ts # Constants
│ └── utils.ts # General utilities
└── debug/ # Debug tree page
├── page.tsx # Debug interface
└── \_utils/ # Debug-specific utilities
├── html.ts # HTML generation for visualization
├── stats.ts # Statistics generation
└── index.ts # Exports

````

## Core Utilities

### tree-builder.ts

Production wrapper for LocationsTree with optimized settings:

```typescript
export interface ProductionTreeOptions {
  fetchAllCounts?: boolean // Default: true - fetch counts for ALL nodes
  hideTrash?: boolean // Default: true - hide trash locations
  sortByCount?: boolean // Default: true - sort by listings count
  areaThreshold?: number // Default: 200 - minimum listings for valid area
  debug?: boolean // Default: false - include debug information
}

await buildProductionTree({
  fetchAllCounts: true, // ✅ Fetch counts for ALL nodes
  hideTrash: true, // ✅ Filter duplicates and zero-count locations
  sortByCount: true, // ✅ Sort by count on all levels
  areaThreshold: 200, // ✅ Mark areas with <200 listings as trash
  debug: false // No debug info
})

// Internally calls LocationsTree.buildTree with:
// checkAll: true, checkOrphans: true, hideTrash: true, sortByCount: true
````

### tree-filters.ts

Filtering and extraction utilities:

- `locationMatchKey()` - normalize location names for searching
- `findAreaByName()`, `findCityByName()` - find locations in tree
- `extractCities()`, `extractNeighborhoods()` - extract data from tree
- `filterDuplicates()`, `filterTrashLocations()` - filter locations

## Tree Processing Pipeline

When `checkAll`, `checkOrphans`, `hideTrash`, and `sortByCount` are enabled:

1. **Fetch Locations** - get all locations from API
2. **Build Tree** - construct hierarchy: Areas → Cities → Neighborhoods
3. **Deduplicate Cities** - merge duplicate cities (e.g., Ottawa issue)
   - Compare by name and boundary coordinates
   - Merge neighborhoods from duplicates
   - Store `duplicateLocationIds`
4. **Normalize Neighborhoods** - deduplicate neighborhoods within cities
   - Group by name
   - Keep variant with boundary (if available)
   - Store `duplicateLocationIds`
5. **Add Trash Status** - mark orphans and duplicates as trash
6. **Add Counts to ALL** - fetch activeCount for ALL nodes ✨
   - Request count for each city
   - Request count for each neighborhood
   - Store in `countsMap`
7. **Mark Trash by Count** - mark locations with 0 listings as trash
8. **Cascade Trash to Areas** - mark empty areas as trash
9. **Mark Areas by Threshold** - mark areas with <threshold listings as trash
10. **Sort by Count** - sort by listings count on ALL levels:
    - Areas by total count
    - Cities within areas
    - Neighborhoods within cities
11. **Filter Trash** - remove trash locations from tree

### Result

- ✅ All duplicates merged
- ✅ All locations have accurate `activeCount`
- ✅ Trash locations filtered out
- ✅ Sorted by popularity
- ✅ Production-ready data

## Usage

### Production code (locations page)

```typescript
import { fetchLocationsData } from './_utils/helpers'

const { areas, cities, hoods, currentLocation } = await fetchLocationsData({
  area,
  city,
  hood
})

// areas, cities, hoods now contain accurate activeCount! ✅
```

### Debug page

```typescript
import { LocationsTree } from 'services/LocationsTree'

// Automatically enables sortByCount when checkAll is enabled
const result = await new LocationsTree().buildTree({
  checkAll: true, // Fetch counts for all
  checkOrphans: true, // Check orphans (important for deduplication)
  hideTrash: true, // Hide trash
  sortByCount: true, // Sort by count (auto-enabled with checkAll)
  areaThreshold: 200, // Area threshold
  debug: true // Include debug info
})
```

**Debug page is identical to production** with these settings:

- `checkAll: true`
- `checkOrphans: true`
- `hideTrash: true`
- `sortByCount: true`

## Area Trash Conditions

An area is marked as trash if:

1. **Total listings < threshold** (default 200)
   - Sum of all counts from cities and neighborhoods in the area
   - Only counts positive values (>= 0)

2. **All cities in area are marked as trash**
   - Cascades from city-level trash status

## Benefits

1. **Logic reuse** - same logic for prod and debug
2. **Accurate counts** - always fetch activeCount for all locations
3. **Deduplication** - automatic duplicate merging
4. **Trash filtering** - no locations with 0 listings
5. **Modularity** - shared utilities in `/locations/_utils`, specific in subfolders
6. **Type safety** - all functions are typed
7. **Performance** - API result caching (revalidate: 3600)

## Completed Tasks

- [x] Create `/locations/_utils` folder with shared utilities
- [x] Update `helpers.ts` to use `buildProductionTree`
- [x] Clean up helpers.ts from unnecessary code
- [x] Implement sorting on all tree levels
- [x] Synchronize production and debug settings
- [x] Add counts display for neighborhoods in SeoDescription
- [ ] Test on production data
- [ ] Add performance monitoring (tree build time)
- [ ] Consider Redis cache for countsMap
