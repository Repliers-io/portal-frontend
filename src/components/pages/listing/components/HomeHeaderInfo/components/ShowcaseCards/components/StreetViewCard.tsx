import VrpanoOutlinedIcon from '@mui/icons-material/VrpanoOutlined'

import { useProperty } from 'providers/PropertyProvider'
import useStreetView from 'hooks/useStreetView'

import { radius, size } from '../constants'

import CardTemplate from './CardTemplate'

const StreetViewCard = () => {
  const { property } = useProperty()
  const { address, map } = property

  const options = { size, radius }
  const { url, thumbnailImage } = useStreetView({
    address,
    map,
    options
  })

  return url ? (
    <CardTemplate
      url={url}
      title="Street view"
      description="Take a walk nearby"
      backgroundImage={url ? thumbnailImage : ''}
      icon={<VrpanoOutlinedIcon sx={{ color: 'white', fontSize: 34 }} />}
    />
  ) : null
}

export default StreetViewCard
