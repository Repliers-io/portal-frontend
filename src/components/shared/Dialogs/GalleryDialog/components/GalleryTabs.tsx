import ViewDayOutlinedIcon from '@mui/icons-material/ViewDayOutlined'
import WeekendOutlinedIcon from '@mui/icons-material/WeekendOutlined'
import { Box, Button, Stack } from '@mui/material'

const GalleryGridGroupTabs = ({
  tab,
  onChange
}: {
  tab: 'grid' | 'groups'
  onChange: (tab: 'grid' | 'groups') => void
}) => {
  return (
    <Box sx={{ position: 'absolute', top: 14, left: 24 }}>
      <Stack spacing={1} direction="row">
        <Button
          size="small"
          color={tab === 'grid' ? 'primary' : 'inherit'}
          startIcon={<ViewDayOutlinedIcon sx={{ width: 20, height: 20 }} />}
          onClick={() => onChange('grid')}
        >
          Grid
        </Button>
        <Button
          size="small"
          color={tab === 'groups' ? 'primary' : 'inherit'}
          startIcon={<WeekendOutlinedIcon sx={{ width: 20, height: 20 }} />}
          onClick={() => onChange('groups')}
        >
          Rooms
        </Button>
      </Stack>
    </Box>
  )
}

export default GalleryGridGroupTabs
