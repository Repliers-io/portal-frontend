import { useTranslations } from 'next-intl'

import { GoogleAuthButton } from './GoogleAuthButton'

const GoogleSignInButton = ({ fullWidth }: { fullWidth?: boolean }) => {
  const t = useTranslations('Forms')

  return (
    <GoogleAuthButton text={t('googleSignInButton')} fullWidth={fullWidth} />
  )
}

export default GoogleSignInButton
