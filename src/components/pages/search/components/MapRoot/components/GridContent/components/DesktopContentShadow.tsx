import { gridSpacing } from '@configs/cards-grids'

import { ContentShadow } from 'components/atoms'

import { useMapOptions } from 'providers/MapOptionsProvider'

const DesktopContentShadow = ({ visible }: { visible: boolean }) => {
  const { layout } = useMapOptions()

  return (
    <ContentShadow
      visible={visible}
      sx={{
        top: 0,
        width: 'auto',
        left: layout === 'grid' ? 0 : (gridSpacing - 1) * 8,
        right: layout === 'grid' ? 0 : (gridSpacing - 1) * 8,
        borderRadius: 1,
        position: 'absolute'
      }}
    />
  )
}

export default DesktopContentShadow
