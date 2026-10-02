import { alpha, Box, Button, darken, Stack, Typography } from '@mui/material'

import { primary, white } from '@configs/colors'

import { toRem } from 'utils/theme'

interface ServiceCardProps {
  title: string
  description: string
  buttonText: string
  href: string
}

const ServiceCard = ({
  title,
  description,
  buttonText,
  href
}: ServiceCardProps) => {
  return (
    <Box
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 1,
        gap: 3,
        border: '1px solid',
        borderColor: 'divider',
        background: alpha(white, 0.3),
        backdropFilter: 'blur(60px)'
      }}
    >
      <Stack spacing={0.5} flex={1}>
        <Typography variant="h4" color="common.white">
          {title}
        </Typography>
        <Typography variant="body1" fontSize={toRem(18)} color="common.white">
          {description}
        </Typography>
      </Stack>
      <Button
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        variant="contained"
        fullWidth
        sx={{
          bgcolor: 'primary.main',
          '&:hover': {
            bgcolor: darken(primary, 0.1)
          }
        }}
      >
        {buttonText}
      </Button>
    </Box>
  )
}

export default ServiceCard
