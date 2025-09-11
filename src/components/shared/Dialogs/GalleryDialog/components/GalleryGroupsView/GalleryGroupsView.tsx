import { Stack } from '@mui/system'

import useBreakpoints from 'hooks/useBreakpoints'

import {
  calculateGroupsLayout,
  getColumnHeight,
  getGroupImageTitle,
  type GroupedInsightsType
} from '../../utils'
import { GalleryGridImage } from '..'

import { GroupContainer } from './components'

const GalleryGroupsView = ({
  groups,
  onImageClick
}: {
  groups: GroupedInsightsType
  onImageClick: (active?: number) => void
}) => {
  const { tablet } = useBreakpoints()
  // TODO: do we need to sort the groups?
  const groupsArray = Object.entries(groups)

  let lastColumnsOfPrevGroup: number | undefined

  return (
    <Stack spacing={4} width="100%" pb={4}>
      {groupsArray.map(([groupName, groupData], groupIndex) => {
        let counter = 0
        const numImages = groupData.images.length

        let preferredStartRow: 'twoItem' | 'threeItem' = 'twoItem'
        if (lastColumnsOfPrevGroup === 3) preferredStartRow = 'threeItem'

        const layoutColumns = calculateGroupsLayout(
          numImages,
          preferredStartRow
        )

        lastColumnsOfPrevGroup = layoutColumns[layoutColumns.length - 1]

        return (
          <GroupContainer name={groupName} key={groupIndex}>
            {groupData.images.map((imgItem, imgIndex) => {
              const columns = layoutColumns[counter] || 2
              counter++

              const { image, originalIndex } = imgItem

              const title = getGroupImageTitle(imgItem)
              const height = getColumnHeight(columns, tablet)

              return (
                <GalleryGridImage
                  key={originalIndex}
                  image={image}
                  height={height}
                  columns={columns}
                  index={imgIndex}
                  count={numImages}
                  title={title}
                  onClick={() => onImageClick(originalIndex)}
                />
              )
            })}
          </GroupContainer>
        )
      })}
    </Stack>
  )
}

export default GalleryGroupsView
