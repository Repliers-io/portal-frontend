import { useTranslations } from 'next-intl'

import { Link, Stack, Typography } from '@mui/material'

import { BannerDescription } from './BannerDescription'

const resources = [
  {
    name: 'frontend',
    documentation: 'https://portal.repliers.com/documentation/frontend',
    repository: 'https://github.com/Repliers-io/portal-frontend'
  },
  {
    name: 'backend',
    documentation: 'https://portal.repliers.com/documentation/backend',
    repository: 'https://github.com/Repliers-io/portal-backend'
  }
] as const

export const BannerDocumentation = () => {
  const t = useTranslations('HomePage.documentation')

  if (process.env.NEXT_PUBLIC_APP_CONFIGURATION !== 'defaults') return null

  return (
    <Stack spacing={4} py={4}>
      {resources.map(({ name, documentation, repository }) => (
        <BannerDescription
          key={name}
          subtitle={
            <>
              <Stack
                component="span"
                direction="row"
                spacing={2}
                alignItems="baseline"
              >
                <Link href={documentation} color="inherit" variant="h3">
                  {t(`${name}.title`)}
                </Link>
                |
                <Link href={repository} color="inherit" variant="h3">
                  {t('repository')}
                </Link>
              </Stack>
              <Typography
                component="span"
                variant="body1"
                color="inherit"
                display="block"
              >
                {t(`${name}.description`)}
              </Typography>
            </>
          }
        />
      ))}
    </Stack>
  )
}
