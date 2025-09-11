import IcoEmptyFavorites from '@icons/IcoEmptyFavorites'

import { EmptyTemplate } from '.'

const EmptyFavorites = () => {
  return (
    <EmptyTemplate
      icon={<IcoEmptyFavorites />}
      title="No favorite properties yet!"
    >
      Start exploring properties and save the ones you love by clicking the
      heart icon.
    </EmptyTemplate>
  )
}

export default EmptyFavorites
