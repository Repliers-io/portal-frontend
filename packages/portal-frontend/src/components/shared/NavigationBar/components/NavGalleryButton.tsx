import { useTranslations } from 'next-intl'

import { IconButton, Tooltip } from '@mui/material'

import { ViewDayOutlinedIcon } from '@configs/icons'

export const NavGalleryButton = ({
  onClick,
  placement = 'bottom'
}: {
  onClick: () => void
  placement?: 'bottom' | 'bottom-start' | 'bottom-end'
}) => {
  const t = useTranslations('NavigationBar')

  return (
    <Tooltip
      arrow
      enterDelay={200}
      placement={placement}
      title={t('openGridGallery')}
    >
      <IconButton color="primary" disableFocusRipple onClick={onClick}>
        <ViewDayOutlinedIcon sx={{ fontSize: 24, m: '2px' }} />
      </IconButton>
    </Tooltip>
  )
}
