import { useTranslations } from 'next-intl'

import { IconButton, Tooltip } from '@mui/material'

import { SmartDisplayOutlinedIcon } from '@configs/icons'

export const NavSlideshowButton = ({ onClick }: { onClick: () => void }) => {
  const t = useTranslations('NavigationBar')

  return (
    <Tooltip
      arrow
      enterDelay={200}
      placement="bottom-start"
      title={t('startSlideshow')}
    >
      <IconButton color="primary" disableFocusRipple onClick={onClick}>
        <SmartDisplayOutlinedIcon sx={{ fontSize: 24, m: '2px' }} />
      </IconButton>
    </Tooltip>
  )
}
