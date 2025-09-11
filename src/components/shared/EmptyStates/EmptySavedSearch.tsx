import IcoEmptyListings from '@icons/IcoEmptyListings'

import { EmptyTemplate } from '.'

const EmptySavedSearch = () => {
  return (
    <EmptyTemplate icon={<IcoEmptyListings />} title="No saved searches yet!">
      Start exploring the map and save neighborhoods you like to stay updated on
      new property listings.
    </EmptyTemplate>
  )
}

export default EmptySavedSearch
