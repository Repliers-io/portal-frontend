import { useFormContext } from 'react-hook-form'

import { GridContainer } from './components'
import { ExpensesSection, LotInformationSection } from './sections'

const AdvancedDetailsStep = () => {
  const { watch } = useFormContext()

  const condoType = watch('listingType') === 'condo'

  return (
    <GridContainer>
      {!condoType && <LotInformationSection />}
      <ExpensesSection />
    </GridContainer>
  )
}

export default AdvancedDetailsStep
