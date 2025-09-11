import IcoEmptyImageFavorites from '@icons/IcoEmptyImageFavorites'

import { EmptyTemplate } from '.'

const EmptyImageFavorites = () => {
  return (
    <EmptyTemplate
      icon={<IcoEmptyImageFavorites />}
      title="No saved images yet!"
    >
      Start saving images of the homes you like by clicking the star icon. Your
      saved pictures will appear here for easy access.
    </EmptyTemplate>
  )
}

export default EmptyImageFavorites
