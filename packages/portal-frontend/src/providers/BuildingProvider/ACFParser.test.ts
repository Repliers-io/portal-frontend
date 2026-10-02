// ACFParser pulls `processShortcodes` from the @shared/CmsContentRenderer barrel,
// which transitively loads the heavy widget/dialog UI tree (fails under jsdom).
// Amenities carry no shortcodes, so stub it to identity for a light unit test.
jest.mock('@shared/CmsContentRenderer', () => ({
  processShortcodes: (content: string) => content
}))

import { ACFParser } from './ACFParser'

const asString = (v: string[] | string): string =>
  typeof v === 'string' ? v : v.join('\n')

describe('ACFParser — amenities', () => {
  it('keeps a flat <ul> list intact — its bullets need the list container', () => {
    // Regression: the unwrap logic used to strip the <ul> (and the first/last
    // <li>) off any list, leaving bare <li> whose bullets spilled outside.
    const amenities =
      '<ul>\n<li><b>NoMa</b>: shops</li>\n<li><b>College</b>: bridge</li>\n<li><b>Transit</b>: buses</li>\n</ul>'

    const parsed = asString(new ACFParser({ amenities }).amenities)

    expect(parsed).toContain('<ul')
    expect((parsed.match(/<li/g) ?? []).length).toBe(3)
  })

  it('unwraps one outer <ul><li> that wraps several nested lists', () => {
    const amenities =
      '<ul><li><strong>Section 1</strong><ul><li>Item 1</li></ul><strong>Section 2</strong><ul><li>Item 2</li></ul></li></ul>'

    const parsed = asString(new ACFParser({ amenities }).amenities)

    // The outer wrapper <ul><li> is removed; the nested sections/lists remain.
    expect(parsed.startsWith('<strong>Section 1</strong>')).toBe(true)
    expect(parsed).toContain('<ul><li>Item 1</li></ul>')
  })

  it('splits a plain-text (non-HTML) amenities blob into a list', () => {
    const parsed = new ACFParser({ amenities: 'Gym\nPool\nRoof deck' })
      .amenities

    expect(parsed).toEqual(['Gym', 'Pool', 'Roof deck'])
  })
})

describe('ACFParser — description', () => {
  it('auto-paragraphs blank-line-separated CMS copy (autop runs before sanitize)', () => {
    const description = 'First paragraph.\n\nSecond paragraph.'

    const parsed = new ACFParser({ description }).description

    expect((parsed.match(/<p[ >]/g) ?? []).length).toBe(2)
  })
})
