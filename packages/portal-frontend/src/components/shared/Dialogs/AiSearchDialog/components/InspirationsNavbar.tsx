import { Button, Stack, Typography } from '@mui/material'

import { WestIcon } from '@configs/icons'

import { capitalize } from 'utils/strings'

const InspirationsNavbar = ({
  title,
  onBack
}: {
  title: string
  onBack?: () => void
}) => {
  return (
    <Stack direction="row" width="100%" alignItems="center" sx={{ my: -1 }}>
      <Button variant="text" startIcon={<WestIcon />} onClick={onBack}>
        Back
      </Button>
      <Typography
        variant="h6"
        sx={{ textAlign: 'center', flex: 1, pr: '96px' }}
      >
        {capitalize(title)}
      </Typography>
    </Stack>
  )
}

export default InspirationsNavbar
