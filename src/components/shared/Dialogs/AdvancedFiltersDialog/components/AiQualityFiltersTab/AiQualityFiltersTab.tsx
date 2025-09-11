import { Stack } from '@mui/material'

import { propertyInsightFeatures } from 'services/API'
import { type Filters } from 'services/Search'
import { keyToLabel } from 'utils/strings'

import { AiQualityButtonGroup, Annotation } from './components'

const AiQualityFiltersTab = ({
  dialogState,
  onChange
}: {
  dialogState: Filters
  onChange: (filters: Filters) => void
}) => {
  return (
    <Stack direction="column" spacing={{ xs: 2, sm: 3, md: 4 }}>
      <AiQualityButtonGroup
        label="Overall"
        name="overallQuality"
        value={dialogState.overallQuality || ''}
        onChange={onChange}
      />

      {propertyInsightFeatures.map((feature) => (
        <AiQualityButtonGroup
          key={feature}
          name={`${feature}Quality`}
          value={dialogState[`${feature}Quality`] || ''}
          label={keyToLabel(feature)}
          onChange={onChange}
        />
      ))}

      <Annotation />
    </Stack>
  )
}
export default AiQualityFiltersTab
