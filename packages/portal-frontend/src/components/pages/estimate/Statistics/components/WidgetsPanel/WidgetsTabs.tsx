import { ToggleButton, ToggleButtonGroup } from '@mui/material'

import { type PropertyClass } from '@configs/filters'

import { sanitizeUrl } from 'utils/urls'

const tabs: { label: string; value: PropertyClass; path: string }[] = [
  { label: 'All', value: 'all', path: '' },
  { label: 'Residential', value: 'residential', path: '/residential' },
  { label: 'Condos', value: 'condo', path: '/condos' }
]

type WidgetsTabsProps = {
  city: string
  propertyClass?: PropertyClass | PropertyClass[]
}

const WidgetsTabs = ({ city, propertyClass }: WidgetsTabsProps) => {
  const citySlug = sanitizeUrl(city)
  const value = Array.isArray(propertyClass) ? propertyClass[0] : propertyClass

  return (
    <ToggleButtonGroup
      exclusive
      value={value}
      sx={{
        '& .MuiToggleButton-root': {
          px: 1.5,
          py: 0.5,
          minHeight: 32,
          fontSize: '0.8125rem',
          fontWeight: 400
        }
      }}
    >
      {tabs.map((tab) => (
        <ToggleButton
          key={tab.value}
          value={tab.value}
          href={`/dashboard/${citySlug}${tab.path}`}
        >
          {tab.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}

export default WidgetsTabs
