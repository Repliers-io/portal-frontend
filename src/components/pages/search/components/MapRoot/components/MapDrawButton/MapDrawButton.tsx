import { useEffect, useRef } from 'react'
import { type GeoJSON, type Position } from 'geojson'

import EditOffOutlinedIcon from '@mui/icons-material/EditOffOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { alpha, Box, Button, Tooltip } from '@mui/material'

import { primary } from '@configs/colors'
import MapboxDraw from '@mapbox/mapbox-gl-draw'

import { useMapOptions } from 'providers/MapOptionsProvider'
import { useSearch } from 'providers/SearchProvider'
import { useUser } from 'providers/UserProvider'
import useClientSide from 'hooks/useClientSide'

import './styles.css'
import drawStyles from './styles'

const drawModeWelcomeTitle = 'Click and drag to draw your search'
const polygonSelectTitle = 'Click inside the polygon to edit it'
const vertexEditModeTitle = 'Click on points to edit them'
const buttonTooltip = 'This feature is available for registered users only.'

const MapDrawButton = ({
  onChange
}: {
  onChange?: (polygon: Position[]) => void
}) => {
  const { logged } = useUser()
  const clientSide = useClientSide()
  const mapDrawRef = useRef<MapboxDraw | null>(null)
  const { polygon, clearPolygon, setPolygon } = useSearch()
  const { setTitle, editMode, setEditMode, clearEditMode } = useMapOptions()
  const { mapRef } = useMapOptions()
  const map = mapRef.current

  const drawMode = editMode === 'draw'

  const tooltipTitle = clientSide && !logged ? buttonTooltip : ''

  const disableMarkerEvents = () =>
    map?.getContainer().classList.add('disable-pointer-events')

  const enableMarkerEvents = () =>
    map?.getContainer().classList.remove('disable-pointer-events')

  const updatePolygon = () => {
    enableMarkerEvents()

    const data = mapDrawRef.current?.getAll().features
    if (data?.length) {
      const arr = (data[0].geometry as GeoJSON.Polygon).coordinates[0]
      setTitle(polygonSelectTitle)
      disableMarkerEvents()
      setPolygon(arr)
      onChange?.(arr)
    }
  }

  const enterDrawMode = () => {
    if (!map) return
    if (!mapDrawRef.current) {
      const mapDraw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: false,
          trash: false
        },
        defaultMode: 'draw_polygon',
        clickBuffer: 15,
        touchBuffer: 15,
        styles: drawStyles
      })

      disableMarkerEvents()

      map.on('draw.create', updatePolygon)
      map.on('draw.update', updatePolygon)

      map.on('draw.selectionchange', (data: any) => {
        if (data.features.length) {
          disableMarkerEvents()
          setTitle(vertexEditModeTitle)
        } else {
          enableMarkerEvents()
          setTitle(polygonSelectTitle)
        }
      })

      map.addControl(mapDraw)
      mapDrawRef.current = mapDraw
    }
  }

  const exitDrawMode = () => {
    enableMarkerEvents()

    if (!map || !mapDrawRef.current) return
    map.removeControl(mapDrawRef.current)
    mapDrawRef.current = null

    map.off('draw.create', updatePolygon)
    map.off('draw.update', updatePolygon)
  }

  const handleDrawClick = () => {
    clearPolygon() // TODO: future task: do not delete existing polygon

    if (drawMode) {
      setTitle(null)
      clearEditMode()
    } else {
      if (polygon) {
        setTitle(polygonSelectTitle)
      } else {
        setTitle(drawModeWelcomeTitle)
      }
      setEditMode('draw')
    }
  }

  useEffect(() => {
    // NOTE: draw mode could be initiated outside of this component
    if (editMode) enterDrawMode()
    else exitDrawMode()
  }, [editMode])

  return (
    <Tooltip title={tooltipTitle} arrow placement="top-end">
      <Box
        sx={{
          right: 16,
          bottom: 159,
          boxShadow: 1,
          zIndex: 'fab',
          borderRadius: 2,
          position: 'absolute',
          display: { xs: 'none', sm: 'block' }
        }}
      >
        <Button
          disabled={!clientSide || !logged}
          onClick={handleDrawClick}
          sx={{
            p: 0.75,
            width: 36,
            height: 36,
            minWidth: 0,
            backdropFilter: 'blur(4px)',
            color: drawMode ? 'common.white' : 'primary.main',
            bgcolor: drawMode ? alpha(primary, 0.8) : alpha('#FFFFFF', 0.7)
          }}
        >
          {drawMode ? (
            <EditOffOutlinedIcon sx={{ fontSize: 22 }} />
          ) : (
            <EditOutlinedIcon sx={{ fontSize: 22 }} />
          )}
        </Button>
      </Box>
    </Tooltip>
  )
}

export default MapDrawButton
