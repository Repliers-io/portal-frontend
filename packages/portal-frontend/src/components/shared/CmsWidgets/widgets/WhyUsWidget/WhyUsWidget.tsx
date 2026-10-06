import { alpha, Box, Container, Stack, Typography } from '@mui/material'

import { white } from '@configs/colors'
import { WidgetWrapper } from '@shared/CmsWidgets/WidgetWrapper'

import { toRem } from 'utils/theme'

import { WidgetHtmlText } from '../../components'

const variantConfig = {
  sell: {
    backgroundImage: '/urbn/seller-why-us-bg.webp',
    items: [
      {
        title: 'The Best Advice',
        description:
          "We'll tour your home together giving you a personalized checklist of high ROI improvements and intros to contractors, stagers and cleaners."
      },
      {
        title: 'Beautiful Marketing',
        description:
          "We'll make your home look great with professional photography, a 3D tour, premium flyers and signage plus placement on top sites."
      },
      {
        title: 'Great Exposure',
        description:
          "We'll get the word out to more buyers by featuring your home here on Urban Living, email blast to our savvy buyers and we'll pitch it to local media."
      },
      {
        title: 'More Buyers',
        description:
          "We'll get more buyers through your door by hosting a broker's open, a Sunday open house and custom events."
      }
    ]
  },
  buy: {
    backgroundImage: '/urbn/buyer-why-us-bg.webp',
    items: [
      {
        title: 'First-timer',
        description:
          "Is this your first purchase? No problem, half of our clients are first-timers. We'll guide you and be there, every step of the way."
      },
      {
        title: 'New construction',
        description:
          "Looking for a brand new home? We've helped clients buy at all the new condos and have worked with the top townhome and single family builders."
      },
      {
        title: 'Relocating',
        description:
          "Moving to Seattle? We'll give you the lay of the land, finding you first the right neighborhood, then the right home."
      },
      {
        title: 'Investor',
        description:
          'As real estate investors ourselves, we know what to look for when buying a rental property.'
      }
    ]
  }
} as const

export type WhyUsVariant = keyof typeof variantConfig

export interface WhyUsWidgetProps {
  variant: WhyUsVariant
  title?: string
  backgroundImage?: string
}

export const WhyUsWidget = ({
  variant,
  title,
  backgroundImage
}: WhyUsWidgetProps) => {
  const config = variantConfig[variant]
  const bgImage = backgroundImage || config.backgroundImage
  const items = config.items

  return (
    <WidgetWrapper
      maxWidth={false}
      bgcolor="common.black"
      sx={{
        py: { xs: 4, md: 6 },
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={4}>
          {title && (
            <Typography variant="h3" color="common.white">
              <WidgetHtmlText>{title}</WidgetHtmlText>
            </Typography>
          )}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)'
              },
              gap: { xs: 2, md: 4 }
            }}
          >
            {items.map((item) => (
              <Box
                key={item.title}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  background: alpha(white, 0.3),
                  backdropFilter: 'blur(60px)'
                }}
              >
                <Stack spacing={0.5}>
                  <Typography variant="h4" color="common.white">
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    fontSize={toRem(18)}
                    color="common.white"
                  >
                    {item.description}
                  </Typography>
                </Stack>
              </Box>
            ))}
          </Box>
        </Stack>
      </Container>
    </WidgetWrapper>
  )
}
