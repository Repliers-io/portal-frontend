import { useMemo, useState } from 'react'

import aiConfig from '@configs/ai-search'

import { useAiSearch } from 'providers/AiSearchProvider'
import { useDialog } from 'providers/DialogProvider'
import { useFeatures } from 'providers/FeaturesProvider'
import { useMapOptions } from 'providers/MapOptionsProvider'

import { BrowserContainer, InspirationsGroup, InspirationsItem } from '.'

const { inspirations, cdnHost } = aiConfig

const InspirationsBrowser = () => {
  const features = useFeatures()
  const { submit } = useAiSearch()
  const { setLayout } = useMapOptions()
  const { hideDialog } = useDialog('ai')

  const [selectedGroup, setSelectedGroup] = useState<string | undefined>(
    undefined
  )

  const groupItems =
    inspirations.find(({ group }) => group === selectedGroup)?.items || []

  const handleBackClick = () => {
    setSelectedGroup(undefined)
  }

  const handleItemClick = (url: string) => {
    const fullUrl = `${cdnHost}${url}`
    submit({ images: [fullUrl] })
    if (features.aiShowOnGrid) setLayout('grid')
    hideDialog()
  }

  const groupCovers = useMemo(() => {
    return inspirations.map(({ group, items }) => ({
      group,
      cover: items[Math.floor(Math.random() * items.length)]
    }))
  }, [])

  return (
    <BrowserContainer title={selectedGroup} onBack={handleBackClick}>
      {selectedGroup
        ? groupItems.map((url) => (
            <InspirationsItem key={url} url={url} onClick={handleItemClick} />
          ))
        : groupCovers.map(({ group, cover }) => (
            <InspirationsGroup
              key={group}
              name={group}
              cover={cover}
              onClick={setSelectedGroup}
            />
          ))}
    </BrowserContainer>
  )
}

export default InspirationsBrowser
