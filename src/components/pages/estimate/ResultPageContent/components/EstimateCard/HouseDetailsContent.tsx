import EstimateWidget from '@shared/Widgets/EstimateWidget'

import { useEstimate } from 'providers/EstimateProvider'
import { formatFullAddress } from 'utils/properties'

import EstimateDetailsContainer from '../EstimateDetailsContainer'

import ButtonsBar from './ButtonsBar'

const HouseDetailsContent = () => {
  const { estimateData, editing } = useEstimate()
  const { estimate, estimateHigh, estimateLow } = estimateData || {}

  const { address } = estimateData?.payload || {}
  const title = address ? formatFullAddress(address) : 'Unknown address'

  return (
    <EstimateDetailsContainer title={title}>
      <EstimateWidget
        estimate={estimate}
        high={estimateHigh}
        low={estimateLow}
      />
      {editing && <ButtonsBar />}
    </EstimateDetailsContainer>
  )
}

export default HouseDetailsContent
