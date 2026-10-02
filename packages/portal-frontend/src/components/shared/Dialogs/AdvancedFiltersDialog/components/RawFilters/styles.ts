import { lighten, type Theme } from '@mui/material'
import { yellow } from '@mui/material/colors'

// the search match: the chip in titles, values and labels, the circle on a chevron
export const matchColor = yellow[300]

// with `rawFilters.previewMatches` off: a field whose values match gets a yellow chevron
export const matchedChevron = {
  '& .MuiAccordionSummary-expandIconWrapper': {
    borderRadius: '50%',
    bgcolor: matchColor
  }
} as const

// the docked search: the 42px pill with 16px below, and 16px above from `sm`; the
// expanded titles dock right under it
const searchBarHeight = { xs: 58, sm: 74 }

// Flat rows as serhant.com's filter lists: no Paper shadow, no Paper corners and no rule
// between rows. Each part takes its own `sx` (MUI wraps the summary in an `h3` heading,
// so descendant selectors from the root miss it).
export const flatAccordion = {
  bgcolor: 'transparent',
  '&::before': { display: 'none' },
  // BaseResponsiveDialog's `.MuiPaper-root` rule also hits the Accordion Paper; its
  // 90vh cap would clip a long list. The Paper's `overflow: hidden` would make it the
  // docked title's scroll container, parking the title 74px inside the row.
  '&&&': { maxHeight: 'none', overflow: 'visible' }
} as const

// An expanded field's title docks under the search while its list scrolls; the heading
// is the accordion's child, so the next expanded field pushes it out and takes its place.
// MUI's heading is `all: unset` (inline), so it is made a block to stick.
export const dockedTitle = {
  // where `scrollIntoView` parks the row: right under the search
  scrollMarginTop: searchBarHeight,
  '&.Mui-expanded > .MuiAccordion-heading': {
    display: 'block',
    position: 'sticky',
    top: searchBarHeight,
    // above the checkboxes' own `z-index: 1` inputs, which would take the title's clicks
    zIndex: 2,
    bgcolor: 'common.white'
  }
} as const

// the 44px black row with its chevron in a round chip: grey on hover, a light navy
// (8% navy on white, opaque for the docked title) with navy text and chevron while expanded
export const flatSummary = {
  minHeight: 44,
  pl: 2,
  pr: 1.5,
  borderRadius: '100px',
  color: 'common.black',
  '&:hover': { bgcolor: 'action.hover' },
  '&.Mui-expanded': {
    color: 'primary.main',
    bgcolor: (theme: Theme) => lighten(theme.palette.primary.main, 0.92)
  },
  '& .MuiAccordionSummary-expandIconWrapper': { color: 'inherit' }
} as const

// the checkboxes keep starting under the title's text, a little below it
export const flatDetails = { pl: 2, pr: 1.5, pt: 1, pb: 2 } as const
