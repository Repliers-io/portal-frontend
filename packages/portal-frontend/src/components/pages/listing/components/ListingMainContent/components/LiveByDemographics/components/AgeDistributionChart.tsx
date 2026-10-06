'use client'

import { PopulationDonut } from '../../Demographics/components'
import type { LiveByAgeSection } from '../types'

export const AgeDistributionChart = ({
  ages,
  hideZero
}: Pick<LiveByAgeSection, 'ages'> & { hideZero?: boolean }) => (
  <PopulationDonut data={ages} hideZero={hideZero} sortByPercentage />
)
