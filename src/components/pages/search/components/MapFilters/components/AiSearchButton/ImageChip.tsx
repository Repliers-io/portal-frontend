import Image from 'next/legacy/image'

import CloseIcon from '@mui/icons-material/Close'
import { Box, IconButton, Stack, Tooltip } from '@mui/material'

const ImageChip = ({
  image,
  onDelete
}: {
  image: string
  onDelete?: (value: string) => void
}) => {
  const handleDelete = (e: any) => {
    onDelete?.(image)
    e.stopPropagation()
    e.preventDefault()
  }

  const handleClick = (e: any) => {
    e.stopPropagation()
    e.preventDefault()
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <Stack
        spacing={0}
        direction="row"
        alignItems="center"
        sx={{
          mr: -0.3,
          borderRadius: 1,
          overflow: 'hidden',
          bgcolor: 'background.default'
        }}
      >
        <Tooltip
          placement="right"
          slotProps={{
            popper: {
              modifiers: [
                {
                  name: 'offset',
                  options: {
                    offset: [0, -130]
                  }
                }
              ]
            },
            tooltip: {
              sx: {
                transformOrigin: 'center !important',
                bgcolor: 'transparent !important',
                p: '0 !important'
              }
            }
          }}
          title={
            <Box
              onClick={handleClick}
              sx={{
                width: 160,
                height: 106,
                boxShadow: 1,
                borderRadius: 1,
                bgcolor: 'divider',
                position: 'relative',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundImage: `url(${image})`
              }}
            >
              <IconButton
                size="small"
                onClick={handleDelete}
                sx={{
                  top: 4,
                  right: 4,
                  position: 'absolute',
                  color: 'common.white'
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          }
        >
          <Box
            sx={{
              width: 72,
              height: 36,
              position: 'relative',
              bgcolor: 'divider'
            }}
          >
            <Image
              unoptimized
              src={image}
              alt="feature"
              layout="fill"
              objectFit="cover"
            />
          </Box>
        </Tooltip>
      </Stack>
    </Box>
  )
}

export default ImageChip
