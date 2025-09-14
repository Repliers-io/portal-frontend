import { Box, Button, Container, Typography } from '@mui/material'

import routes from '@configs/routes'

import { headerHeight } from './AuthView/AuthView'

const RedirectView = () => {
  return (
    <Container maxWidth="lg">
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{
          height: `calc(100vh - ${headerHeight}px)`
        }}
      >
        <Typography component="div">
          Redirecting to{' '}
          <Button
            variant="text"
            sx={{
              mx: 1,
              fontWeight: 600
            }}
            onClick={() => {
              window.location.href = routes.login
            }}
          >
            Sign in
          </Button>{' '}
          page...
        </Typography>
      </Box>
    </Container>
  )
}

export default RedirectView
