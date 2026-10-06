import { type ApiListing, type HistoryItemType } from 'services/API'
import { property1 } from 'utils/listings/__mocks__'

import { getHistoryItemLink, historyItemUrl } from './utils'

// Board 2 is a distinct MLS-number namespace, board 90 is the default read board —
// the multi-board setup this routing rule exists for.
jest.mock('@configs/search', () => {
  const actual = jest.requireActual('@configs/search').default
  return {
    __esModule: true,
    default: { ...actual, defaultBoardId: 90, distinctBoardIds: [2] }
  }
})

const listing = { ...property1, boardId: 90 } as unknown as ApiListing

const historyItem = (item: Partial<HistoryItemType>) =>
  ({ mlsNumber: 'N5641448', lastStatus: 'Ter', ...item }) as HistoryItemType

describe('historyItemUrl', () => {
  it('routes a record with a distinct-namespace board with its own board suffix', () => {
    expect(historyItemUrl(listing, historyItem({ boardId: 2 }))).toContain(
      'N5641448-2'
    )
  })

  it('keeps a record on the default read board board-less', () => {
    const url = historyItemUrl(listing, historyItem({ boardId: 90 }))

    expect(url).toContain('N5641448')
    expect(url).not.toContain('N5641448-')
  })

  it('falls back to the open listing board when the record carries none', () => {
    const url = historyItemUrl(listing, historyItem({}))

    expect(url).toContain('N5641448')
    expect(url).not.toContain('N5641448-')
  })
})

describe('getHistoryItemLink', () => {
  it('returns no link for the record shown on this page', () => {
    expect(getHistoryItemLink(listing, historyItem({ boardId: 2 }), true)).toBe(
      ''
    )
  })

  it('returns no link when lastStatus is redacted', () => {
    expect(
      getHistoryItemLink(
        listing,
        historyItem({
          lastStatus: '!scrubbed!' as HistoryItemType['lastStatus']
        }),
        false
      )
    ).toBe('')
  })

  it('returns a board-aware link otherwise', () => {
    expect(
      getHistoryItemLink(listing, historyItem({ boardId: 2 }), false)
    ).toContain('N5641448-2')
  })
})
