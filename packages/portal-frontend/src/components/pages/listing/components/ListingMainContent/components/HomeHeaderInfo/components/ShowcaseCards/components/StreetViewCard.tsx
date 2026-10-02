import { useTranslations } from 'next-intl'

import { VrpanoOutlinedIcon } from '@configs/icons'

import { CardTemplate } from '.'

export const StreetViewCard = ({
  url,
  thumbnailImage
}: {
  url: string
  thumbnailImage: string
}) => {
  const t = useTranslations()

  return (
    <CardTemplate
      url={url}
      title={t('PDP.showcaseCards.streetView.title')}
      description={t('PDP.showcaseCards.streetView.description')}
      backgroundImage={thumbnailImage}
      icon={<VrpanoOutlinedIcon sx={{ color: 'white', fontSize: 34 }} />}
    />
  )
}
