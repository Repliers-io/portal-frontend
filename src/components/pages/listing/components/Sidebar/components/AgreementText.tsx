import { Link, Typography } from '@mui/material'

import content from '@configs/content'
import routes from '@configs/routes'

const AgreementText = () => (
  <Typography variant="caption" color="hint">
    By pressing Request Info, you agree that {content.siteName} and real estate
    professionals may contact you via phone/text about your inquiry, which may
    involve the use of automated means. You also agree to our{' '}
    <Link href={routes.privacy}>Terms of Use</Link>.&nbsp; {content.siteName}{' '}
    does not endorse any real estate professionals.
  </Typography>
)

export default AgreementText
