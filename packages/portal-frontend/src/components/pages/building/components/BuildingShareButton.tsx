import { ShareButton } from '@shared/Buttons'

import { useBuilding } from 'providers/BuildingProvider'

export const BuildingShareButton = ({
  variant = 'outlined'
}: {
  variant?: 'outlined' | 'icon'
}) => {
  const { name, description } = useBuilding()

  const cleanText = description
    ? description
        .replace(/<h[1-6][^>]*>.*?<\/h[1-6]>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    : ''

  return <ShareButton variant={variant} title={name} text={cleanText} />
}
