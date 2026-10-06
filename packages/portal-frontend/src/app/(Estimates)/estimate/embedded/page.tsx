'use client'

import { EstimateEmbeddedFormContent } from '@pages/estimate'

import EstimateProvider from 'providers/EstimateProvider'
import EstimateStepsProvider from 'providers/EstimateStepsProvider'
import SearchProvider from 'providers/SearchProvider'
import SelectOptionsProvider from 'providers/SelectOptionsProvider'

export const dynamic = 'force-dynamic'

const EstimateEmbeddedPage = () => {
  return (
    <SearchProvider>
      <SelectOptionsProvider>
        <EstimateProvider embedded>
          <EstimateStepsProvider>
            <EstimateEmbeddedFormContent />
          </EstimateStepsProvider>
        </EstimateProvider>
      </SelectOptionsProvider>
    </SearchProvider>
  )
}

export default EstimateEmbeddedPage
