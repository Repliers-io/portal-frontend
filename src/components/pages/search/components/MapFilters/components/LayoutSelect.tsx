import ViewModuleRoundedIcon from '@mui/icons-material/ViewModuleRounded'
import { Skeleton, ToggleButton, ToggleButtonGroup } from '@mui/material'

import IcoMap from '@icons/IcoMap'

import { useMapOptions } from 'providers/MapOptionsProvider'
import useClientSide from 'hooks/useClientSide'

const LayoutSelect = () => {
  const clientSide = useClientSide()
  const { layout, setLayout } = useMapOptions()

  const handleChange = (_e: any, value: typeof layout) => {
    if (value) setLayout(value)
  }

  if (!clientSide) {
    return <Skeleton variant="rounded" sx={{ width: 107, height: 38 }} />
  }

  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={layout}
      onChange={handleChange}
      sx={{
        width: 107,
        maxHeight: 38,
        '& .MuiToggleButton-root': { px: 2 }
      }}
    >
      <ToggleButton value="map">
        <IcoMap />
      </ToggleButton>
      <ToggleButton value="grid">
        <ViewModuleRoundedIcon fontSize="small" />
      </ToggleButton>
    </ToggleButtonGroup>
  )
}

export default LayoutSelect
