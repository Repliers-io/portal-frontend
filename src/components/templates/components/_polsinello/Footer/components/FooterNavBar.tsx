import { Container, Link, Stack, Typography } from '@mui/material'

import routes from '@configs/routes'

const config = {
  links: [
    {
      label: 'Accessibility',
      href: routes.accessibility
    },
    {
      label: 'Terms of Service',
      href: routes.terms
    },
    {
      label: 'Privacy Policy',
      href: routes.privacy
    },
    {
      label: 'DMCA Notice',
      href: routes.dmca
    }
  ],
  copyright: {
    text: '© Copyright {year}, The Polsinello Team. All Rights Reserved.',
    year: new Date().getFullYear()
  }
}

const FooterNavBar = () => {
  const { links, copyright } = config

  return (
    <Stack boxSizing="border-box" bgcolor="secondary.main" p={2}>
      <Container>
        <Stack
          spacing={1}
          direction={{
            xs: 'column',
            md: 'row'
          }}
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            justifyContent={{
              xs: 'center',
              sm: 'flex-start'
            }}
          >
            <Typography lineHeight={2} variant="body2" color="#FFF9">
              {copyright.text.replace('{year}', copyright.year.toString())}
            </Typography>
          </Stack>
          <Stack spacing={2} direction="row" justifyContent="center">
            {links.map(({ label, href }, index) => (
              <Typography
                key={`${href}-${index}`}
                lineHeight={2}
                variant="body2"
                color="#FFF9"
              >
                <Link href={href} target="_blank" underline="hover">
                  {label}
                </Link>
              </Typography>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Stack>
  )
}

export default FooterNavBar
