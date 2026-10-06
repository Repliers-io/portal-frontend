import { sanitizeUrl } from 'utils/urls'

import {
  buildLocationRedirects,
  canonicalSlug,
  legacySlugs
} from './location-redirects-core'

const tree = [
  {
    n: 'Toronto',
    s: [
      {
        n: 'North York',
        s: [
          { n: 'Bathurst Manor', c: 100 },
          { n: 'Brookhaven-Amesbury', c: 50 },
          { n: 'Milliken', c: 40 },
          { n: 'Milliken Mills East', c: 30 },
          { n: 'Lakeview', c: 10 },
          { n: "L'Amoreaux", c: 20 }
        ]
      },
      { n: 'Etobicoke', s: [{ n: 'Lakeview', c: 80 }] }
    ]
  }
]

const rules = buildLocationRedirects(tree, '/on')
const sourceIndex = (source: string) =>
  rules.findIndex((rule) => rule.source === source)

describe('buildLocationRedirects', () => {
  it('covers a neighbourhood with one city-bearing rule', () => {
    expect(rules).toContainEqual({
      source: '/bathurst-manor-:city/:rest*',
      destination: '/on/north-york/bathurst-manor'
    })
    expect(
      rules.filter((rule) => rule.source.startsWith('/bathurst-manor'))
    ).toHaveLength(1)
  })

  it('orders a longer slug ahead of the slug it starts with', () => {
    expect(sourceIndex('/milliken-mills-east-:city/:rest*')).toBeLessThan(
      sourceIndex('/milliken-:city/:rest*')
    )
  })

  it('keeps the busiest node when one name sits in two cities', () => {
    expect(rules).toContainEqual({
      source: '/lakeview-:city/:rest*',
      destination: '/on/etobicoke/lakeview'
    })
  })

  it('honours a correctly named city on an ambiguous name, ahead of the catch-all', () => {
    expect(rules).toContainEqual({
      source: '/lakeview-north-york/:rest*',
      destination: '/on/north-york/lakeview'
    })
    expect(rules).toContainEqual({
      source: '/lakeview-etobicoke/:rest*',
      destination: '/on/etobicoke/lakeview'
    })
    expect(sourceIndex('/lakeview-north-york/:rest*')).toBeLessThan(
      sourceIndex('/lakeview-:city/:rest*')
    )
  })

  // A hyphen reaches the portal as a non-breaking one, so the plain-hyphen source
  // and the encoded destination are deliberately different spellings.
  it('sources a hyphenated name plainly and destinations it canonically', () => {
    expect(rules).toContainEqual({
      source: '/brookhaven-amesbury-:city/:rest*',
      destination: '/on/north-york/brookhaven%E2%80%91amesbury'
    })
  })

  it('serves both apostrophe spellings, ordered by their own length', () => {
    const destination = "/on/north-york/l'amoreaux"
    expect(rules).toContainEqual({
      source: '/lamoreaux-:city/:rest*',
      destination
    })
    expect(rules).toContainEqual({
      source: '/l-amoreaux-:city/:rest*',
      destination
    })
    expect(sourceIndex('/l-amoreaux-:city/:rest*')).toBeLessThan(
      sourceIndex('/lamoreaux-:city/:rest*')
    )
  })
})

/**
 * What matters is that the rule set covers every URL shape, not how many rules
 * it takes, so pin the shapes against the exact matcher Next compiles these
 * sources with. A Next upgrade that changes matching fails here instead of
 * silently dropping redirects in production.
 */
describe('cities and areas', () => {
  it('covers a city, whose legacy suffix was the region', () => {
    expect(rules).toContainEqual({
      source: '/north-york/:rest*',
      destination: '/on/north-york'
    })
    expect(rules).toContainEqual({
      source: '/north-york-:city/:rest*',
      destination: '/on/north-york'
    })
  })

  it('sends an area to its short, city-position URL', () => {
    expect(rules).toContainEqual({
      source: '/toronto-:city/:rest*',
      destination: '/on/toronto'
    })
  })

  it('leaves a slug a neighbourhood shares to the neighbourhood', () => {
    const shared = buildLocationRedirects(
      [
        {
          n: 'Peel Region',
          s: [{ n: 'Milton', c: 9, s: [{ n: 'Milton', c: 7 }] }]
        }
      ],
      '/on'
    )

    expect(shared).toContainEqual({
      source: '/milton-:city/:rest*',
      destination: '/on/milton/milton'
    })
    expect(
      shared.filter((rule) => rule.source === '/milton-:city/:rest*')
    ).toHaveLength(1)
  })
})

describe('the legacy-suffix catch-alls', () => {
  // City counts decide which area the bare rule falls back to, so they are the
  // point of this fixture — the shared one above leaves them out.
  const regional = buildLocationRedirects(
    [
      { n: 'Toronto', s: [{ n: 'North York', c: 10, s: [] }] },
      { n: 'Peel Region', s: [{ n: 'Mississauga', c: 5, s: [] }] },
      { n: 'Durham Region', s: [{ n: 'Oshawa', c: 3, s: [] }] }
    ],
    '/on'
  )

  it('lands an unknown place on the area its slug names', () => {
    expect(regional).toContainEqual({
      source: '/:slug-peel-region/neighbourhood-profile',
      destination: '/on/peel-region'
    })
  })

  it('keeps the bare rule last, on the busiest area', () => {
    expect(regional.at(-1)).toEqual({
      source: '/:slug/neighbourhood-profile',
      destination: '/on/toronto'
    })
  })

  it('stays behind the literal rules that would otherwise lose to it', () => {
    const first = rules.findIndex((rule) => rule.source.startsWith('/:slug'))
    const literal = rules.findIndex(
      (rule) => rule.source === '/bathurst-manor-:city/:rest*'
    )

    expect(literal).toBeLessThan(first)
  })

  it('reads the region out of a partial segment, as Next parses it', () => {
    const { pathToRegexp } = require('next/dist/compiled/path-to-regexp') as {
      pathToRegexp: (source: string, keys: { name: string }[]) => RegExp
    }
    const forArea = (slug: string) =>
      pathToRegexp(`/:slug-${slug}/neighbourhood-profile`, [])

    expect(
      forArea('peel-region').test(
        '/port-credit-mississauga-peel-region/neighbourhood-profile'
      )
    ).toBe(true)
    expect(
      forArea('toronto').test(
        '/port-credit-mississauga-peel-region/neighbourhood-profile'
      )
    ).toBe(false)
    // the area name alone is a literal rule's business, not the catch-all's
    expect(
      forArea('peel-region').test('/peel-region/neighbourhood-profile')
    ).toBe(false)
  })
})

describe('the generated sources, matched by Next', () => {
  const { pathToRegexp } = require('next/dist/compiled/path-to-regexp') as {
    pathToRegexp: (source: string, keys: { name: string }[]) => RegExp
  }

  const sources = rules
    .filter((rule) => rule.destination === '/on/north-york/bathurst-manor')
    .map((rule) => pathToRegexp(rule.source, []))
  const matches = (path: string) => sources.some((re) => re.test(path))

  it.each([
    '/bathurst-manor-toronto/neighbourhood-profile', // wrong city
    '/bathurst-manor-north-york/neighbourhood-profile', // right city, two words
    '/bathurst-manor-whitchurch-stouffville/x', // three words
    '/bathurst-manor-toronto', // city, no tail
    '/bathurst-manor-toronto/homes/for-sale/page/2' // deep tail
  ])('matches %s', (path) => expect(matches(path)).toBe(true))

  it.each([
    '/bathurst-manorzzz/x', // the hyphen is the boundary, not a prefix match
    '/bathurst-man/x',
    '/bathurst-manor/neighbourhood-profile', // no city: the legacy site never
    '/bathurst-manor', // emitted this, so only the catch-all answers it
    '/on/north-york/bathurst-manor' // the destination itself
  ])('does not match %s', (path) => expect(matches(path)).toBe(false))
})

describe('legacySlugs', () => {
  it('returns one slug when the name carries no apostrophe', () => {
    expect(legacySlugs('Bathurst Manor')).toEqual(['bathurst-manor'])
  })

  it.each([
    ["L'Amoreaux", ['lamoreaux', 'l-amoreaux']],
    ["Devil's Elbow", ['devils-elbow', 'devil-s-elbow']],
    [
      "Sutton & Jackson's Point",
      ['sutton-jacksons-point', 'sutton-jackson-s-point']
    ]
  ])('returns both spellings for %s', (name, expected) => {
    expect(legacySlugs(name)).toEqual(expected)
  })
})

describe('canonicalSlug', () => {
  it.each([
    'Brookhaven-Amesbury',
    'Hillcrest Village - North York',
    "L'Amoreaux"
  ])('matches sanitizeUrl for %s', (name) => {
    expect(canonicalSlug(name)).toBe(sanitizeUrl(name))
  })
})

/**
 * The replay the generator is actually judged on: legacy slugs in the shape the old
 * sitemap emits them, resolved through the matcher Next compiles the sources with,
 * asserted on the **destination**. Checking that a rule exists, or that some rule
 * matched, is what let `/central-ajax-durham-region` land in Oshawa — a rule matched,
 * just not the right one.
 */
describe('resolving a legacy URL in the shape the sitemap emits it', () => {
  const { pathToRegexp } = require('next/dist/compiled/path-to-regexp') as {
    pathToRegexp: (source: string, keys: { name: string }[]) => RegExp
  }

  // Counts and placements copied from public/movesmartly-com/locations.json: both
  // Durham cities carry a Central, Lakeview sits in Mississauga and Oshawa, Dorset
  // Park in Scarborough and Milton. These are the names whose city half decides.
  const gta = [
    {
      n: 'Toronto',
      s: [{ n: 'Scarborough', c: 213, s: [{ n: 'Dorset Park', c: 213 }] }]
    },
    {
      n: 'Durham Region',
      s: [
        {
          n: 'Oshawa',
          c: 369,
          s: [
            { n: 'Central', c: 190 },
            { n: 'Lakeview', c: 179 }
          ]
        },
        { n: 'Ajax', c: 182, s: [{ n: 'Central', c: 182 }] }
      ]
    },
    {
      n: 'Peel Region',
      s: [{ n: 'Mississauga', c: 301, s: [{ n: 'Lakeview', c: 301 }] }]
    },
    {
      n: 'Halton Region',
      s: [{ n: 'Milton', c: 19, s: [{ n: 'Dorset Park', c: 19 }] }]
    }
  ]

  const gtaRules = buildLocationRedirects(gta, '/on')
  const profile = (slug: string) => `/${slug}/neighbourhood-profile`
  const resolve = (path: string) =>
    gtaRules.find(({ source }) => pathToRegexp(source, []).test(path))
      ?.destination
  const slug = (name: string) => legacySlugs(name)[0]

  // Verbatim from legacy-sitemap-urls-no-listings.txt — the four URLs out of 499
  // whose city half names a city other than the busiest namesake.
  it('honours the city the slug names, region tail and all', () => {
    expect(resolve(profile('central-ajax-durham-region'))).toBe(
      '/on/ajax/central'
    )
    expect(resolve(profile('central-oshawa-durham-region'))).toBe(
      '/on/oshawa/central'
    )
    expect(resolve(profile('lakeview-oshawa-durham-region'))).toBe(
      '/on/oshawa/lakeview'
    )
    expect(resolve(profile('dorset-park-milton-halton-region'))).toBe(
      '/on/milton/dorset-park'
    )
  })

  // The same property over the whole tree rather than four hand-picked URLs: every
  // neighbourhood the grammar can name must reach its own page, never a namesake's.
  it('routes every neighbourhood the grammar can name to its own page', () => {
    const misrouted = gta.flatMap((area) =>
      area.s.flatMap((city) =>
        city.s
          .map((hood) => {
            const url = profile(
              `${slug(hood.n)}-${slug(city.n)}-${slug(area.n)}`
            )
            const expected = `/on/${canonicalSlug(city.n)}/${canonicalSlug(hood.n)}`
            return resolve(url) === expected ? '' : `${url} -> ${resolve(url)}`
          })
          .filter(Boolean)
      )
    )

    expect(misrouted).toEqual([])
  })

  // Toronto's own form drops the city — `/dorset-park-toronto` names the area — so
  // the busiest namesake is all the URL supports, and the region twin must not
  // swallow it into some other city's rule.
  it('keeps the busiest node where the slug names an area or a wrong city', () => {
    expect(resolve(profile('dorset-park-toronto'))).toBe(
      '/on/scarborough/dorset-park'
    )
    expect(resolve(profile('lakeview-caledon-peel-region'))).toBe(
      '/on/mississauga/lakeview'
    )
  })
})
