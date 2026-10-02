import { useTranslations } from 'next-intl'

import { Box, Button, Container, Typography } from '@mui/material'

import routes from '@configs/routes'

import { contentHeight } from './AuthView'

export const RedirectView = () => {
  const t = useTranslations('Templates')

  return (
    <Container maxWidth="lg">
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{
          height: contentHeight
        }}
      >
        <Typography component="div">
          {t.rich('redirecting', {
            link: (chunks) => (
              <Button
                variant="text"
                sx={{ mx: 1, fontWeight: 600 }}
                onClick={() => {
                  window.location.href = routes.login
                }}
              >
                {chunks}
              </Button>
            )
          })}
        </Typography>
      </Box>
    </Container>
  )
}
