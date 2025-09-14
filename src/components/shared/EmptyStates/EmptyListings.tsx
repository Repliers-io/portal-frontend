import IcoEmptyListings from '@icons/IcoEmptyListings'

import { EmptyTemplate } from '.'

const EmptyListings = () => {
  return (
    <EmptyTemplate
      icon={<IcoEmptyListings />}
      title="No listings found in this area!"
    >
      Try zooming out or exploring a more populated area to discover available
      properties.
    </EmptyTemplate>
  )
}

export default EmptyListings
