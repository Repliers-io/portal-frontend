import { Stack, Typography } from '@mui/material'

import { ScrubbedDate, ScrubbedPrice } from 'components/atoms'

import { type Property } from 'services/API'

const ListedPropertyPrice = ({ property }: { property: Property }) => {
  const { listPrice, soldDate } = property

  return (
    <Stack>
      <Typography variant="h2" sx={{ textDecoration: 'line-through' }}>
        <span>Listed: </span>
        <ScrubbedPrice value={listPrice} />
      </Typography>
      {soldDate && (
        <Typography
          color="text.hint"
          sx={{
            width: { xs: 'auto', sm: '100%', lg: 'auto' }
          }}
        >
          Sale date: <ScrubbedDate value={soldDate} />
        </Typography>
      )}
    </Stack>
  )
}

export default ListedPropertyPrice
