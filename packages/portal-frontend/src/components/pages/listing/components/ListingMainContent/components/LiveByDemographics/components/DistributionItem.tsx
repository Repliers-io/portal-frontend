import { type LiveByDistributionGroup } from '../types'

import { DistributionGroup } from './DistributionGroup'
import { DonutDistributionGroup } from './DonutDistributionGroup'
import { StackedDistributionGroup } from './StackedDistributionGroup'

export const DistributionItem = ({
  hideZero,
  ...group
}: LiveByDistributionGroup & { hideZero?: boolean }) => {
  if (group.variant === 'stacked')
    return <StackedDistributionGroup {...group} hideZero={hideZero} />
  if (group.variant === 'donut')
    return (
      <DonutDistributionGroup
        title={group.title}
        items={group.items}
        hideZero={hideZero}
        sortByPercentage={group.sortByPercentage}
      />
    )
  return <DistributionGroup {...group} hideZero={hideZero} />
}
