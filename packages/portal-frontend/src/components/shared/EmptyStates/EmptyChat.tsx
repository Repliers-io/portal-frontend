import { useTranslations } from 'next-intl'

import { Box, darken } from '@mui/material'

import { divider as strokeColor } from '@configs/colors'
import { ReviewsOutlinedIcon } from '@configs/icons'

import { EmptyTemplate } from '.'

export const EmptyChat = ({ aiColor = '#FFCB63' }) => {
  const t = useTranslations('EmptyStates')

  return (
    <Box sx={{ mr: -2 }}>
      <EmptyTemplate
        icon={
          <Box
            sx={{
              mt: '38px',
              width: '90px',
              height: '90px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'background.default',
              borderRadius: '50%'
            }}
          >
            <ReviewsOutlinedIcon
              sx={{
                fontSize: '48px',
                color: darken(strokeColor, 0.2),
                '& path:nth-of-type(2)': {
                  color: aiColor
                }
              }}
            />
          </Box>
        }
        title={t('Chat.title')}
      >
        {t('Chat.description')}
      </EmptyTemplate>
    </Box>
  )
}
