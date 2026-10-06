import { Stack } from '@mui/material'

import { propertyInsightFeatures } from 'services/API'
import { type Filters } from 'services/Search'
import { keyToLabel, sentenceCase } from 'utils/strings'

import { AiQualityButtonGroup, Annotation } from './components'

export const AiQualityFiltersTab = ({
  dialogState,
  onChange
}: {
  dialogState: Filters
  onChange: (filters: Filters) => void
}) => {
  return (
    <Stack direction="column" spacing={{ xs: 2, sm: 3, md: 4 }} pb={2}>
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
          label={sentenceCase(keyToLabel(feature))}
          onChange={onChange}
        />
      ))}

      <Annotation />
    </Stack>
  )
}
