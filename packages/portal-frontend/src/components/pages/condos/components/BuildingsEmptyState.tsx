import { EmptyListingsIcon } from '@configs/icons'
import { EmptyTemplate } from '@shared/EmptyStates'

type BuildingsEmptyStateProps = {
  location: string
}

export const BuildingsEmptyState = ({ location }: BuildingsEmptyStateProps) => {
  return (
    <EmptyTemplate
      icon={<EmptyListingsIcon />}
      title={`No buildings found in ${location}`}
    >
      Try exploring a different area or check back later for new buildings.
    </EmptyTemplate>
  )
}
