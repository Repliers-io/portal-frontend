import {
  EditOffOutlinedIcon,
  EditOutlinedIcon,
  GestureIcon
} from '@configs/icons'
import { MapControlButton } from '@shared/Map'

import { type DrawTool, useMapDrawButton } from './useMapDrawButton'

export const MapDrawButton = ({
  mode = 'draw',
  desktopOnly = true
}: {
  mode?: DrawTool
  desktopOnly?: boolean
}) => {
  const { tooltipTitle, active, disabled, onClick } = useMapDrawButton(mode)

  const Icon =
    mode === 'freehand'
      ? GestureIcon
      : active
        ? EditOffOutlinedIcon
        : EditOutlinedIcon

  return (
    <MapControlButton
      title={tooltipTitle}
      desktopOnly={desktopOnly}
      active={active}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon sx={{ fontSize: 22 }} />
    </MapControlButton>
  )
}
