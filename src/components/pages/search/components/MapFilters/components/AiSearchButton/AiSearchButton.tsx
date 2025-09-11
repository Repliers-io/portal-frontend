import { Box, Button, Skeleton, Stack } from '@mui/material'

import { secondary } from '@configs/colors'
import IcoAi from '@icons/IcoAi'

import { useAiSearch } from 'providers/AiSearchProvider'
import { useDialog } from 'providers/DialogProvider'
import useClientSide from 'hooks/useClientSide'

import { FeatureChip, ImageChip } from '.'

const AiSearchButton = ({ size }: { size: 'medium' | 'small' }) => {
  const clientSide = useClientSide()
  const { showDialog } = useDialog('ai')
  const { images, features, reset } = useAiSearch()
  const showChip = images.length || features.length

  if (!clientSide) {
    return (
      <Skeleton
        variant="rounded"
        sx={{
          width: { xs: 46, sm: 133 },
          height: { xs: 38, sm: 48 }
        }}
      />
    )
  }

  if (size === 'small') {
    return (
      <Button
        size="small"
        color="secondary"
        variant="outlined"
        onClick={showDialog}
        sx={{
          px: 1.5,
          minWidth: 32,
          display: { xs: 'block', sm: 'none' }
        }}
      >
        <IcoAi color={secondary} />
      </Button>
    )
  }

  return (
    <Button
      size="medium"
      disableRipple
      component="div"
      color="secondary"
      variant="outlined"
      onClick={showDialog}
      sx={{ minWidth: { xs: 46, sm: 133 }, px: 2 }}
      startIcon={<IcoAi />}
    >
      <Stack
        spacing={2}
        direction="row"
        alignItems="center"
        sx={{ mr: showChip ? -1 : 0 }}
      >
        <Box sx={{ whiteSpace: 'nowrap' }}>AI Search</Box>
        {features.map((label, index) => (
          <FeatureChip key={index} label={label} onDelete={reset} />
        ))}
        {images.map((image, index) => (
          <ImageChip key={index} image={image} onDelete={reset} />
        ))}
      </Stack>
    </Button>
  )
}

export default AiSearchButton
