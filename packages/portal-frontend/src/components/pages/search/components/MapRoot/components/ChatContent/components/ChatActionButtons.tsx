import { useTranslations } from 'next-intl'

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
  const t = useTranslations()

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
        >
          {t('AiChat.applyFilters')}
        </Button>
      )}

      {!loading && button === 'reset' && (
        <Button
          size="small"
          color="error"
          variant="contained"
          startIcon={<DeleteOutlineOutlinedIcon />}
          onClick={onReset}
        >
          {t('EmptyStates.Catalog.resetFilters')}
        </Button>
      )}
    </Stack>
  )
}
