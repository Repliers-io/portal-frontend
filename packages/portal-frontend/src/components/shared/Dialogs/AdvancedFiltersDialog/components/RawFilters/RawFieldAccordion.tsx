'use client'

import { Fragment, type SyntheticEvent, useRef } from 'react'
import { useTranslations } from 'next-intl'

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  type Theme,
  Typography
} from '@mui/material'

import filtersConfig from '@configs/filters'
import { ExpandMoreIcon } from '@configs/icons'
import { ToolbarMenuItemBadge } from '@templates/components/Header/components/ToolbarMenu'

import { sentenceCase } from 'utils/strings'

import {
  dockedTitle,
  flatAccordion,
  flatDetails,
  flatSummary,
  matchedChevron
} from './styles'

import { Highlighted } from './Highlighted'

const previewSize = 3
const { previewMatches } = filtersConfig.rawFilters

/** One raw field: its row expands in place into the field's checkbox list. */
export const RawFieldAccordion = ({
  label,
  match,
  matches = [],
  options,
  selected,
  onChange
}: {
  label: string
  // the searched text, marked in the title, the preview and the labels
  match?: string
  // the field's values that contain it: previewed under the title, or a yellow chevron
  matches?: string[]
  // `null` while the options load
  options: string[] | null
  selected: string[]
  onChange: (values: string[]) => void
}) => {
  const t = useTranslations('Dialogs.AdvancedFilters')

  const available = options ?? []
  // a selected value the list no longer carries still gets its checkbox to clear it
  const values = [
    ...available,
    ...selected.filter((value) => !available.includes(value))
  ]

  const toggle = (value: string) =>
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    )

  // Collapsing a docked title (its heading rides below the row's top) would drop the
  // list from under the pointer; the row's top is scrolled back to the docking line
  // first, so the title stays where it was and the list folds up under it.
  const rowRef = useRef<HTMLDivElement>(null)
  const keepDockedTitle = (_event: SyntheticEvent, expanded: boolean) => {
    const row = rowRef.current
    const heading = row?.firstElementChild
    if (!row || !heading || expanded) return
    if (heading.getBoundingClientRect().top > row.getBoundingClientRect().top)
      row.scrollIntoView({ block: 'start' })
  }

  return (
    <Accordion
      ref={rowRef}
      disableGutters
      square
      elevation={0}
      sx={{ ...flatAccordion, ...dockedTitle }}
      slotProps={{ transition: { unmountOnExit: true } }}
      onChange={keepDockedTitle}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={[
          flatSummary,
          !previewMatches && matches.length > 0 && matchedChevron
        ]}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* inherits the row's colour: black, navy while expanded */}
          <Typography variant="body2" fontWeight={700} color="inherit">
            <Highlighted text={label} match={match} />
          </Typography>
          {previewMatches && matches.length > 0 && (
            <Typography
              variant="caption"
              color="text.secondary"
              component="div"
            >
              {matches.slice(0, previewSize).map((value, index) => (
                <Fragment key={value}>
                  {index > 0 && ', '}
                  <Highlighted text={sentenceCase(value)} match={match} />
                </Fragment>
              ))}
              {matches.length > previewSize &&
                ` ${t('rawMore', { count: matches.length - previewSize })}`}
            </Typography>
          )}
        </Box>
        {/* the tabs' count circle, right before the chevron, centred on the row
            however many lines the title takes */}
        {selected.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', mx: 1 }}>
            <ToolbarMenuItemBadge
              inline
              color="primary"
              count={selected.length}
            />
          </Box>
        )}
      </AccordionSummary>
      <AccordionDetails sx={flatDetails}>
        {options ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              columnGap: 2
            }}
          >
            {values.map((value) => (
              <FormControlLabel
                key={value}
                label={<Highlighted text={sentenceCase(value)} match={match} />}
                // a 40px row for one line; a wrapped label keeps the box on its first line
                sx={{
                  m: 0,
                  py: 1.25,
                  alignItems: 'flex-start',
                  // hovering the row (all of it toggles) lights the round halo a MUI
                  // Switch shows around its thumb; the theme turns the checkbox's own
                  // off. Pointer devices only: a tap would leave it stuck on a touch screen.
                  '@media (hover: hover)': {
                    '&:hover .MuiCheckbox-root': { bgcolor: 'action.hover' }
                  }
                }}
                slotProps={{ typography: { variant: 'body2' } }}
                control={
                  <Checkbox
                    checked={selected.includes(value)}
                    onChange={() => toggle(value)}
                    sx={{
                      // The box (the theme's 24px icon, 1.714rem here, plus 9px padding
                      // each side) folds to the label's line height, its glyph centred
                      // on the first line.
                      my: ({ typography }: Theme) =>
                        `calc((${typography.body2.lineHeight} - ${typography.pxToRem(24)} - 18px) / 2)`,
                      color: 'common.black',
                      '&.Mui-checked': { color: 'common.black' }
                    }}
                  />
                }
              />
            ))}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  )
}
