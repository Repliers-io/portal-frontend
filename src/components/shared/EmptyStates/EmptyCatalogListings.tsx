import { Button } from '@mui/material'

import IcoEmptyListings from '@icons/IcoEmptyListings'

import { EmptyTemplate } from '.'

const EmptyCatalogListings = ({ onReset }: { onReset?: () => void }) => {
  return (
    <EmptyTemplate
      icon={<IcoEmptyListings />}
      title={`No listings found for this area${onReset ? ' and filters' : ''}.`}
    >
      {onReset && (
        <Button variant="contained" onClick={onReset}>
          Reset filters
        </Button>
      )}
    </EmptyTemplate>
  )
}

export default EmptyCatalogListings
