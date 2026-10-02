import { useTranslations } from 'next-intl'

import { Box, DialogContent, DialogTitle, Stack } from '@mui/material'

import { GoogleSignInButton } from '@shared/Buttons'
import { LegalText } from '@shared/Forms'

const ThirdPartyLoginForm = () => {
  const t = useTranslations('Forms')

  return (
    <>
      <DialogTitle>{t('signInTitle')}</DialogTitle>
      <DialogContent
        sx={{ px: { sm: 8 }, pb: 4, minHeight: 'auto', flexGrow: 0 }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 480,
            pt: { xs: 7, sm: 1 },
            mx: 'auto'
          }}
        >
          <Stack spacing={4} alignItems="center" justifyContent="center">
            <GoogleSignInButton />

            <LegalText
              centered
              variant="body2"
              action={t('signInWithGoogle')}
            />
          </Stack>
        </Box>
      </DialogContent>
    </>
  )
}

export default ThirdPartyLoginForm
