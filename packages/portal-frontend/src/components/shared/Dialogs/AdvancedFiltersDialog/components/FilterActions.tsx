import { Box, Button, DialogActions, Stack } from '@mui/material'

import { RestartAltIcon } from '@configs/icons'

import { toSafeNumber } from 'utils/formatters'
import { pluralize } from 'utils/strings'

export const FilterActions = ({
  count,
  onReset,
  onSubmit
}: {
  count: number | null
  onReset: () => void
  onSubmit: () => void
}) => {
  const showLabel = `Show ${pluralize(toSafeNumber(count), {
    one: '1 listing',
    many: '$ listings'
  })}`

  return (
    <DialogActions>
      <Stack
        spacing={{ xs: 2, sm: 4 }}
        width="100%"
        direction="row"
        justifyContent="center"
      >
        <Button
          variant="outlined"
          onClick={onReset}
          startIcon={<RestartAltIcon />}
          sx={{
            width: { xs: 'auto', sm: '50%' },
            minWidth: { xs: 'auto', sm: 192 }
          }}
        >
          Reset{' '}
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
            &nbsp;filters
          </Box>
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          loading={count === null}
          sx={{
            px: 1,
            width: '50%',
            minWidth: 192,
            // wrap the count onto a second line instead of overflowing the
            // fixed-width button; tight line-height keeps the extra row compact
            whiteSpace: 'normal',
            lineHeight: 1.2
          }}
        >
          {showLabel}
        </Button>
      </Stack>
    </DialogActions>
  )
}
