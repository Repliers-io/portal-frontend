import { Container } from '@mui/material'

import { CardSurface } from '@shared/Listing'

import { ListingGallery, ListingNavigationBar } from './components'

export const ListingHeader = ({ embedded }: { embedded?: boolean }) => (
  <>
    <Container>
      <CardSurface surface="gallery">
        <ListingGallery />
      </CardSurface>
    </Container>

    <ListingNavigationBar embedded={embedded} />
  </>
)
