import Image from 'next/image'

import { Grid, IconButton } from '@mui/material'

import { toSafeNumber } from 'utils/formatters'

const GroupImage = ({
  columns = 2,
  image,
  index,
  count,
  height,
  title = '',
  onClick
}: {
  image: string
  index?: number
  count?: number
  height: number
  columns: number
  title?: string
  onClick: (index?: number) => void
}) => {
  return (
    <Grid size={{ sm: columns }} className="grid-item">
      <IconButton
        disableFocusRipple
        onClick={() => onClick(index)}
        sx={{
          p: 0,
          height,
          width: '100%',
          borderRadius: 0,
          overflow: 'hidden',
          bgcolor: 'background.default'
        }}
        title={title}
      >
        <Image
          fill
          sizes="(max-width: 600px) 100vw, 400px"
          style={{ objectFit: 'cover' }}
          unoptimized
          src={image}
          alt={count ? `${toSafeNumber(index) + 1} of ${count}` : ''}
        />
      </IconButton>
    </Grid>
  )
}

export default GroupImage
