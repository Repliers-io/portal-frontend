import { Container, Link, Stack, Typography } from '@mui/material'

import routes from '@configs/routes'

const config = {
  links: [
    {
      label: 'Privacy Policy',
      href: routes.privacy
    }
  ],
  copyright: {
    text: '© Copyright {year}, All Rights Reserved.',
    year: new Date().getFullYear()
  }
}

const FooterNavBar = () => {
  const { links, copyright } = config

  return (
    <Stack boxSizing="border-box" bgcolor="primary.dark" p={2}>
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
            spacing={1}
            direction="row"
            alignItems="center"
            flexWrap="wrap"
            justifyContent={{
              xs: 'center',
              sm: 'flex-start'
            }}
          >
            <Typography lineHeight={2} variant="caption" color="common.white">
              {copyright.text.replace('{year}', copyright.year.toString())}
            </Typography>
          </Stack>
          <Stack spacing={2} direction="row" justifyContent="center">
            {links.map(({ label, href }, index) => (
              <Typography
                key={`${href}-${index}`}
                lineHeight={2}
                variant="caption"
                color="common.white"
                textAlign="center"
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
