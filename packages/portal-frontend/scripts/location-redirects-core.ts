/**
 * Legacy neighbourhood URLs → portal location pages.
 *
 * The old site addressed a neighbourhood with a single first segment —
 * `/bathurst-manor-toronto/neighbourhood-profile` inside Toronto,
 * `/central-ajax-durham-region/…` outside it, where the place half names the area
 * rather than the city as often as not (Bathurst Manor sits in North York), and
 * the trailing path is arbitrary. The rule never matches on the city — `:city`
 * just swallows it — which is what makes a wrong one harmless, and `:rest*`
 * swallows the tail, including no tail at all. Cities and areas were addressed the same way (`/markham-york-region`,
 * `/toronto`), so they get the same pair — behind the neighbourhoods, which own any
 * slug they share. A path naming a place absent from the tree falls through to
 * one catch-all on the busiest area.
 *
 * One rule could cover both (`{-:city([^/]+)}?`), but that leans on
 * path-to-regexp group syntax Next does not document and v8 reassigns. The pair
 * costs ~45µs per non-matching request, measured — far below what the coupling
 * would cost on the next Next upgrade.
 *
 * Shared by generate-location-redirects.ts and its test.
 */

/** Node shape of public/<tenant>/locations.json — see services/LocationsTree/cache.ts */
type CompactNode = {
  /** name */
  n: string
  /** activeCount */
  c?: number
  /** children — cities under an area, neighbourhoods under a city */
  s?: CompactNode[]
}

export type LocationRedirect = { source: string; destination: string }

/** Tail the pre-portal site put on every neighbourhood profile. */
const legacyProfileSuffix = 'neighbourhood-profile'

const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/**
 * The slugs the legacy site could have used: every run of non-alphanumerics
 * becomes one hyphen. An apostrophe is the one character the two common
 * slugifiers disagree on — dropped (`l'amoreaux` → `lamoreaux`) or treated as a
 * separator (`l-amoreaux`) — so a name carrying one gets both spellings. Any
 * further variant is out of scope: an unmatched URL keeps the behaviour it has
 * today.
 */
export const legacySlugs = (name: string) =>
  [...new Set([slugify(name.replace(/['’]/g, '')), slugify(name)])].filter(
    Boolean
  )

/**
 * Copy of sanitizeUrl (src/utils/urls.ts), which a build script cannot import —
 * its module graph resolves tsconfig aliases. The destination has to match the
 * portal's own spelling exactly: a hyphenated name reached through a plain
 * hyphen renders a page whose listings query a name the tree does not contain.
 * location-redirects-core.test.ts asserts the two stay identical.
 */
export const canonicalSlug = (name: string) =>
  encodeURIComponent(
    name.replaceAll('-', '‑').replaceAll(' ', '-').toLowerCase()
  )

type Candidate = { city: string; count: number; destination: string }
type Place = { count: number; destination: string }

export const buildLocationRedirects = (
  areas: CompactNode[],
  prefix: string
): LocationRedirect[] => {
  const bySlug = new Map<string, Candidate[]>()

  for (const area of areas) {
    for (const city of area.s ?? []) {
      for (const hood of city.s ?? []) {
        const candidate = {
          city: city.n,
          count: hood.c ?? 0,
          destination: `${prefix}/${canonicalSlug(city.n)}/${canonicalSlug(hood.n)}`
        }

        for (const slug of legacySlugs(hood.n))
          bySlug.set(slug, [...(bySlug.get(slug) ?? []), candidate])
      }
    }
  }

  // Each rule is sorted by its literal part, so carry it alongside.
  const rules: (LocationRedirect & { literal: string })[] = []

  for (const [slug, candidates] of bySlug) {
    // The same neighbourhood name exists in more than one city, and a legacy URL
    // with a wrong or missing city cannot tell them apart, so the busiest node
    // wins — the tie-break resolveLocation() already uses.
    const busiest = candidates.reduce((top, c) =>
      c.count > top.count ? c : top
    )

    // When it IS ambiguous, a legacy URL that happens to name the city correctly
    // deserves the page it names: an exact rule per candidate, ahead of the
    // catch-all by virtue of its longer literal. Skipped where the exact spelling
    // is itself a neighbourhood — that neighbourhood's own rule owns the path.
    //
    // The region-bearing twin is the one that fires: outside Toronto the legacy
    // segment carries the region as well (`/central-ajax-durham-region`), and
    // `:rest*` is a separate segment with nothing to absorb that tail, so the bare
    // literal never equals it. `-:region` swallows the tail whole — a trailing
    // param may contain hyphens, a param followed by one may not, which is why
    // `-:city-:region` cannot split the two (it reads `ajax-durham` + `region`).
    if (candidates.length > 1) {
      for (const candidate of candidates) {
        for (const citySlug of legacySlugs(candidate.city)) {
          const literal = `${slug}-${citySlug}`
          if (bySlug.has(literal)) continue
          for (const source of [
            `/${literal}/:rest*`,
            `/${literal}-:region/:rest*`
          ])
            rules.push({ literal, source, destination: candidate.destination })
        }
      }
    }

    // Only the city-bearing form: every one of the 499 neighbourhood URLs in the
    // legacy sitemap carries a city half, and nothing in that inventory reaches a
    // neighbourhood by its bare name — so the plain twin doubled the rule count
    // for a spelling the old site never emitted. Cities and areas keep both
    // forms below, where the bare one does occur (`/toronto/…`).
    rules.push({
      literal: slug,
      source: `/${slug}-:city/:rest*`,
      destination: busiest.destination
    })
  }

  // The same first segment also addressed a city or an area — `/markham-york-region`,
  // `/toronto` — with the region where a neighbourhood URL carries the city. Same pair
  // of rules, and a slug a neighbourhood already owns stays with the neighbourhood: it
  // is the more specific place and by far the more common legacy URL.
  const byPlace = new Map<string, Place[]>()

  const addPlace = (name: string, destination: string, count: number) => {
    for (const slug of legacySlugs(name)) {
      if (bySlug.has(slug)) continue
      byPlace.set(slug, [...(byPlace.get(slug) ?? []), { count, destination }])
    }
  }

  for (const area of areas) {
    for (const city of area.s ?? [])
      addPlace(city.n, `${prefix}/${canonicalSlug(city.n)}`, city.c ?? 0)

    // An area goes to its short, city-position URL — the canonical one, which
    // resolveLocation() maps back to the area. Where a city shares the name that
    // same URL resolves to the city, which is the order resolveLocation() wants,
    // so the marker form is never needed here. Requires the area to be listed in
    // the tenant locationConfig.cityPositionAreas, as the parser has no tree.
    addPlace(area.n, `${prefix}/${canonicalSlug(area.n)}`, area.c ?? 0)
  }

  for (const [slug, candidates] of byPlace) {
    const busiest = candidates.reduce((top, c) =>
      c.count > top.count ? c : top
    )

    rules.push(
      {
        literal: slug,
        source: `/${slug}/:rest*`,
        destination: busiest.destination
      },
      {
        literal: slug,
        source: `/${slug}-:city/:rest*`,
        destination: busiest.destination
      }
    )
  }

  // Longest literal first: a neighbourhood slug is often a prefix of another one
  // and Next applies the first matching rule — `/milliken-:city` would otherwise
  // swallow `/milliken-mills-east` and read the rest of the name as a city.
  const sorted = rules
    .sort(
      (a, b) =>
        b.literal.length - a.literal.length ||
        a.literal.localeCompare(b.literal)
    )
    .map(({ source, destination }) => ({ source, destination }))

  // Catch-alls for a legacy path naming a place the tree has no node for — the
  // old site profiled places this tree does not carry. The slug's tail names the
  // area it belonged to (`port-credit-mississauga-peel-region`), the one hint such
  // a path still gives, so every area gets its own rule and only a slug with no
  // area tail falls through to the busiest one. Landing on the right area beats
  // the 404 these reach today through LEGACY_FALLBACK_HOST.
  //
  // They come after the sort on purpose: Next applies the first match, so every
  // literal rule above gets its chance first. `/:slug-<area>/` keeps the param
  // inside one segment — asserted against Next's own matcher in the test, since
  // the shape of a partial segment is the parser's call, not ours. The legacy
  // suffix is the gate that keeps all of this off live portal paths.
  if (!areas.length) return sorted

  const areaUrl = (area: CompactNode) => `${prefix}/${canonicalSlug(area.n)}`

  const byArea = areas
    .flatMap((area) => legacySlugs(area.n).map((slug) => ({ slug, area })))
    .sort(
      (a, b) => b.slug.length - a.slug.length || a.slug.localeCompare(b.slug)
    )
    .map(({ slug, area }) => ({
      source: `/:slug-${slug}/${legacyProfileSuffix}`,
      destination: areaUrl(area)
    }))

  const listings = (area: CompactNode) =>
    (area.s ?? []).reduce((sum, city) => sum + (city.c ?? 0), 0)
  const busiestArea = areas.reduce((top, area) =>
    listings(area) > listings(top) ? area : top
  )

  return [
    ...sorted,
    ...byArea,
    {
      source: `/:slug/${legacyProfileSuffix}`,
      destination: areaUrl(busiestArea)
    }
  ]
}
