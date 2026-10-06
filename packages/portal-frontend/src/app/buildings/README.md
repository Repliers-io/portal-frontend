# Buildings WordPress Structure

## Routing Structure

### Pages

- **`/buildings`** - Buildings index page showing all groups with their buildings
- **`/buildings/[...path]`** - Browse specific building group (e.g., `/buildings/downtown-condos`)
- **`/building/[slug]`** - Single building detail page (e.g., `/building/the-tower`)

### Components

- **`BuildingsIndexContent`** - Universal component for both index and browse
  - Single group → shows breadcrumbs (browse mode)
  - Multiple groups → shows group titles with links (index mode)
- **`BuildingPageContent`** - Single building details
- **`BuildingCard`** - Building preview card with image and address
- **`BuildingBreadcrumbs`** - Breadcrumbs for browse pages

### Utility Functions (`_utils.ts`)

- **`fetchBuildingGroups()`** - Fetch all building groups (custom post type "buildings")
- **`fetchBuildingsWithMedia(buildingIds)`** - Fetch buildings by IDs with first slideshow media
- **`fetchAllGroupsWithBuildings()`** - Fetch all groups with their buildings (for index page)
- **`fetchGroupWithBuildings(groupSlug)`** - Fetch single group with its buildings (for browse page)

## Naming Convention Clarification

⚠️ **Important**: The WordPress naming for buildings is reversed/inverse, which can be confusing:

### In WordPress:

- **Custom Post Type "buildings"** → These are actually GROUPS/CATEGORIES of buildings (like folders/containers)
  - Examples: "Downtown Condos", "Capitol Hill Apartments", "Waterfront Buildings"

- **"Categories" field in each building post** → These are actually the INDIVIDUAL buildings
  - Examples: "The Tower", "Skyline Apartments", "Harbor View"

### In Code:

```typescript
// Fetch all building groups (custom post type "buildings")
const groups = await fetchBuildingGroups()

// Each group has ACF field "categories" which are IDs of actual buildings
const buildingIds = groups.flatMap((group) => group.acf?.categories || [])

// Fetch the actual buildings (stored as "categories" in WP taxonomy)
const buildings = await wpClient.getCategoriesByIds(buildingIds)

// For single building, fetch by slug with ACF fields
const building = await wpClient.getCategoryBySlug(slug)
```

## Structure Example

```
Building Group (Custom Post "buildings")
├── Title: "Downtown Condos"
├── Slug: "downtown-condos"
├── ACF.categories: [123, 456, 789]  ← IDs of actual buildings
│
Individual Buildings (WP Categories with IDs 123, 456, 789)
├── 123: "The Tower"
│   ├── Slug: "the-tower"
│   └── ACF.slideshow: [media-id-1, media-id-2, ...]
│   └── ACF.map.address: "123 Main St"
├── 456: "Skyline Apartments"
│   ├── Slug: "skyline-apartments"
│   └── ACF.slideshow: [media-id-3, media-id-4, ...]
│   └── ACF.map.address: "456 Oak Ave"
└── 789: "Harbor View"
    ├── Slug: "harbor-view"
    └── ACF.slideshow: [media-id-5, media-id-6, ...]
    └── ACF.map.address: "789 Water St"
```

## Data Flow

### Index Page (`/buildings/page.tsx`)

```typescript
const buildingGroups = await fetchAllGroupsWithBuildings()
// Returns array of { type: group, buildings: [...] }
```

1. Fetch all building groups (custom posts)
2. Extract individual building IDs from each group's `acf.categories` field
3. Fetch actual building data via `getCategoriesByIds()`
4. Fetch first media from each building's slideshow
5. Group buildings by their parent group
6. Pass to `BuildingsIndexContent` with multiple groups

### Browse Page (`/buildings/[...path]/page.tsx`)

```typescript
const result = await fetchGroupWithBuildings(groupSlug)
// Returns { type: group, buildings: [...] } or null
```

1. Find building group by slug
2. Get building IDs from `acf.categories`
3. Fetch buildings and media
4. Create single-group array
5. Pass to `BuildingsIndexContent` (auto-detects browse mode)

### Single Building (`/building/[slug]/page.tsx`)

```typescript
const building = await wpClient.getCategoryBySlug(slug)
// Returns BlogCategory with ACF fields
```

1. Fetch building by slug using `getCategoryBySlug(slug)`
2. Pass to `BuildingProvider` context
3. Display in `BuildingPageContent`

## Type Definitions

```typescript
type BuildingGroup = {
  type: {
    id: string // Post.id from custom post type
    title: string
    slug: string
  }
  buildings: Array<{
    building: {
      id: number // BlogCategory.id from WP category
      name: string
      slug: string
      acf?: {
        slideshow?: number[]
        map?: { address?: string }
      }
    }
    media: any | null
  }>
}
```
