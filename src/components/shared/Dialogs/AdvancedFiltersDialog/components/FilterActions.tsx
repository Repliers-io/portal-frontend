import RestartAltIcon from '@mui/icons-material/RestartAlt'
import { Box, Button, DialogActions, Stack } from '@mui/material'

import { toSafeNumber } from 'utils/formatters'
import { pluralize } from 'utils/strings'

const FilterActions = ({
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
      <Stack spacing={4} width="100%" direction="row" justifyContent="center">
        <Button
          variant="outlined"
          size="large"
          onClick={onReset}
          startIcon={<RestartAltIcon />}
          sx={{ minWidth: { xs: 'auto', sm: 192 }, width: '50%' }}
        >
          Reset{' '}
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
            &nbsp;filters
          </Box>
        </Button>
        <Button
          size="large"
          variant="contained"
          onClick={onSubmit}
          loading={count === null}
          sx={{ whiteSpace: 'nowrap', minWidth: 192, width: '50%', px: 1 }}
        >
          {showLabel}
        </Button>
      </Stack>
    </DialogActions>
  )
}

export default FilterActions
