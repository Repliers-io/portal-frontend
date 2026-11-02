import { parseParams } from './utils'

// The defaults tenant ships an empty `distinctBoardIds`, so neither the board
// suffix nor `?boardId=` would be exercised against the real config.
jest.mock('@configs/search', () => ({
  __esModule: true,
  default: {
    ...jest.requireActual('@configs/search').default,
    defaultBoardId: 90,
    distinctBoardIds: [2, 90, 91]
  }
}))

const parse = (listingName: string, searchParams = {}) =>
  parseParams({ listingName: [listingName] }, searchParams)

describe('parseParams', () => {
  it('resolves old and labelled-unit URBN slugs to the same listing', () => {
    for (const slug of [
      '3603-2510-6th-avenue-seattle-98121-2597026',
      '2510-6th-ave-unit-3603-seattle-98121-2597026'
    ]) {
      expect(parse(slug)).toMatchObject({ listingId: '2597026', boardId: 90 })
    }
  })

  it('reads the board from the url suffix', () => {
    expect(parse('25-bedford-road-toronto-C13766232-91')).toMatchObject({
      listingId: 'C13766232',
      boardId: 91
    })
  })

  it('reads the board from ?boardId= when the url carries no suffix', () => {
    expect(
      parse('25-bedford-road-toronto-C13766232', { boardId: '91' })
    ).toMatchObject({ listingId: 'C13766232', boardId: 91 })
  })

  it('lets the url suffix win over ?boardId=', () => {
    expect(
      parse('25-bedford-road-toronto-C13766232-91', { boardId: '2' })
    ).toMatchObject({ boardId: 91 })
  })

  it('ignores a ?boardId= the tenant does not address', () => {
    expect(
      parse('25-bedford-road-toronto-C13766232', { boardId: '777' })
    ).toMatchObject({ boardId: 90 })
  })

  it('falls back to the default board when no board is given', () => {
    expect(parse('25-bedford-road-toronto-C13766232')).toMatchObject({
      boardId: 90
    })
  })
})
