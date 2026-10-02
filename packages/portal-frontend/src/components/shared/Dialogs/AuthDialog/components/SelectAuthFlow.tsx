import { useTranslations } from 'next-intl'

import { Button, Stack, Typography } from '@mui/material'

import { type AuthFlow } from './AuthForm'

const SelectAuthFlow = ({
  flow,
  onChange
}: {
  flow: AuthFlow
  onChange: (flow: AuthFlow) => void
}) => {
  const t = useTranslations('Forms')

  return (
    <Stack spacing={1} justifyContent={'center'} alignItems="center">
      <Typography fontWeight={600}>
        {flow === 'login' ? t('dontHaveAccount') : t('alreadyHaveAccount')}
      </Typography>

      <Button
        variant="text"
        sx={{ fontWeight: 600, minWidth: 94 }}
        onClick={() => onChange(flow === 'login' ? 'signup' : 'login')}
      >
        {flow === 'login' ? t('signUpTitle') : t('signInTitle')}
      </Button>
    </Stack>
  )
}

export default SelectAuthFlow
