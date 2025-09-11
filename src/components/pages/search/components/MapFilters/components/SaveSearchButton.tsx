import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import { Button, Skeleton, Tooltip } from '@mui/material'

import { useDialog } from 'providers/DialogProvider'
import { useMapOptions } from 'providers/MapOptionsProvider'
import { useSaveSearch } from 'providers/SaveSearchProvider/SaveSearchProvider'
import { useSearch } from 'providers/SearchProvider'
import { useUser } from 'providers/UserProvider'
import useClientSide from 'hooks/useClientSide'

const maxListingsLimit = 100

const SaveSearchButton = ({ size }: { size: 'medium' | 'small' }) => {
  const { logged } = useUser()
  const clientSide = useClientSide()
  const { loading } = useSaveSearch()
  const { count, polygon } = useSearch()
  const { showDialog: showLogin } = useDialog('auth')
  const { showDialog: showConfirmation } = useDialog('save-search')
  const { layout, setEditMode, clearEditMode } = useMapOptions()

  const showDialog = () => {
    if (!logged) showLogin()
    else showConfirmation()
  }

  const highlightSearchArea = () => {
    if (!polygon) setEditMode('highlight')
  }

  const hideSearchAreaHighlighting = () => {
    if (polygon) setEditMode('draw')
    else clearEditMode()
  }

  const place = polygon
    ? ' inside the area. Try to edit it.'
    : layout === 'map'
      ? ' on screen. Try to zoom in.'
      : '. Tighten your search filters.' // layout === 'grid

  const limitTitle = `We cannot save searches with more than ${maxListingsLimit} listings${place}`
  const loginTitle = ''

  const disabled = loading || !count || count > maxListingsLimit
  const tooltipTitle = !logged ? loginTitle : disabled ? limitTitle : ''

  if (!clientSide) {
    return (
      <Skeleton
        variant="rounded"
        sx={{
          width: { xs: 46, sm: 158 },
          height: { xs: 38, sm: 48 }
        }}
      />
    )
  }

  return size === 'medium' ? (
    <Tooltip arrow placement="bottom" title={tooltipTitle}>
      <span>
        <Button
          size="medium"
          variant="outlined"
          disabled={disabled}
          onClick={showDialog}
          startIcon={<SaveOutlinedIcon />}
          onMouseEnter={highlightSearchArea}
          onMouseLeave={hideSearchAreaHighlighting}
          sx={{ display: { xs: 'none', sm: 'flex' }, minWidth: 158 }}
        >
          Save Search
        </Button>
      </span>
    </Tooltip>
  ) : (
    <Button
      size="small"
      variant="outlined"
      onClick={showDialog}
      sx={{ display: { xs: 'block', sm: 'none' }, minWidth: 32 }}
    >
      <SaveOutlinedIcon sx={{ fontSize: 20, mx: -0.5 }} />
    </Button>
  )
}

export default SaveSearchButton
