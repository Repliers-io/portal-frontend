import { Button, Stack, Typography } from '@mui/material'

import { type AuthFlow } from './AuthForm'

const SelectAuthFlow = ({
  flow,
  onChange
}: {
  flow: AuthFlow
  onChange: (flow: AuthFlow) => void
}) => {
  return (
    <Stack spacing={1} justifyContent={'center'} alignItems="center">
      <Typography fontWeight={600}>
        {flow === 'login'
          ? 'Don’t have an account?'
          : 'Already have an account?'}
      </Typography>

      <Button
        variant="text"
        sx={{ fontWeight: 600, minWidth: 94 }}
        onClick={() => onChange(flow === 'login' ? 'signup' : 'login')}
      >
        {flow === 'login' ? 'Sign up' : 'Sign in'}
      </Button>
    </Stack>
  )
}

export default SelectAuthFlow
