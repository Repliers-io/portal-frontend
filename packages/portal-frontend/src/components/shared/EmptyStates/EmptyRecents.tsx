import { useTranslations } from 'next-intl'

import { Box, darken } from '@mui/material'

import { divider as strokeColor } from '@configs/colors'
import { HistoryOutlinedIcon } from '@configs/icons'

import { EmptyTemplate } from '.'

export const EmptyRecents = () => {
  const t = useTranslations('EmptyStates')

  return (
    <EmptyTemplate
      icon={
        <Box
          sx={{
            width: '90px',
            height: '90px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            borderRadius: '50%'
          }}
        >
          <HistoryOutlinedIcon
            sx={{
              fontSize: '48px',
              color: darken(strokeColor, 0.2),
              ml: -0.33
            }}
          />
        </Box>
      }
      title={t('Recents.title')}
    >
      {t('Recents.description')}
    </EmptyTemplate>
  )
}
