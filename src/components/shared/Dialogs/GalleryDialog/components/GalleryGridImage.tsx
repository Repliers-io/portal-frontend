import Image from 'next/legacy/image'

import { Grid2 as Grid, IconButton } from '@mui/material'

import { toSafeNumber } from 'utils/formatters'
import { getCDNPath } from 'utils/urls'

const GroupImage = ({
  columns = 2,
  image,
  index,
  count,
  height,
  title = '',
  onClick
}: {
  image: any
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
          bgcolor: 'background.default',
          '& span': {
            display: 'block !important'
          }
        }}
        title={title}
      >
        <Image
          unoptimized
          layout="fill"
          objectFit="cover"
          src={getCDNPath(image, 'large')}
          alt={count ? `${toSafeNumber(index) + 1} of ${count}` : ''}
        />
      </IconButton>
    </Grid>
  )
}

export default GroupImage
