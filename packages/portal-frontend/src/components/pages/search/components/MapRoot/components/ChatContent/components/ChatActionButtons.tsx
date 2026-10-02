import { Button, CircularProgress, Stack } from '@mui/material'

import {
  DeleteOutlineOutlinedIcon,
  HolidayVillageOutlinedIcon
} from '@configs/icons'

export const ChatActionButtons = ({
  button,
  loading,
  onApply,
  onReset
}: {
  button: 'apply' | 'reset'
  loading?: boolean
  onApply: () => void
  onReset: () => void
}) => {
  return (
    <Stack spacing={1} direction="row" alignItems="center" px={2}>
      {(button === 'apply' || loading) && (
        <Button
          size="small"
          color="secondary"
          variant="contained"
          disabled={loading}
          startIcon={
            loading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <HolidayVillageOutlinedIcon />
            )
          }
          onClick={onApply}
          sx={{ width: 142 }}
        >
          Apply Filters
        </Button>
      )}

      {!loading && button === 'reset' && (
        <Button
          size="small"
          color="error"
          variant="contained"
          startIcon={<DeleteOutlineOutlinedIcon />}
          onClick={onReset}
          sx={{ width: 142 }}
        >
          Reset Filters
        </Button>
      )}
    </Stack>
  )
}
