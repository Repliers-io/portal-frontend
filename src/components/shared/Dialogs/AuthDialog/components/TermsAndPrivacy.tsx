import Link from 'next/link'

import { Typography } from '@mui/material'

import routes from '@configs/routes'

const TermsAndPrivacy = () => {
  return (
    <Typography
      variant="body2"
      align="center"
      sx={{ a: { textDecoration: 'underline' } }}
    >
      By clicking continue you acknowledge that you have read and agree to our{' '}
      <Link href={routes.terms} target="_blank">
        terms of service
      </Link>{' '}
      and{' '}
      <Link href={routes.privacy} target="_blank">
        privacy policy
      </Link>
      .
    </Typography>
  )
}
export default TermsAndPrivacy
