import { Stack } from '@mui/material'

import gridConfig from '@configs/cards-grids'
import { type PropertyClass } from '@configs/filters'
import { WidgetsPanel } from '@pages/estimate/Statistics/components/WidgetsPanel/WidgetsPanel'
import WidgetsTabs from '@pages/estimate/Statistics/components/WidgetsPanel/WidgetsTabs'
import { StatsGraph } from '@shared/Stats'

import { type ApiStatisticResponse } from 'services/API'
import { cityGeoFilters } from 'utils/filters'

type StatisticsProps = {
  city: string
  propertyClass: PropertyClass
  showTabs?: boolean
  ssrData?: ApiStatisticResponse | null
}

const Statistics = ({
  city,
  propertyClass,
  showTabs,
  ssrData
}: StatisticsProps) => {
  const geoFilters = cityGeoFilters(city)

  return (
    <Stack spacing={gridConfig.widgetSpacing}>
      <WidgetsPanel
        {...geoFilters}
        name={city}
        propertyClass={propertyClass}
        tabsSlot={
          showTabs && <WidgetsTabs city={city} propertyClass={propertyClass} />
        }
        ssrData={ssrData}
      />
      <StatsGraph {...geoFilters} propertyClass={propertyClass} />
    </Stack>
  )
}

export default Statistics
