import type { Population } from '../Demographics/types'

export type LiveByScalarMetric = {
  kind: 'scalar'
  label: string
  value: string
}

export type LiveByDistributionItem = {
  label: string
  percentage: number
  color?: string
}

export type LiveByDistributionGroup = {
  kind: 'distribution'
  title: string
  items: LiveByDistributionItem[]
  columns?: number
  span?: number
  variant?: 'bars' | 'stacked' | 'donut'
  sortByPercentage?: boolean
}

export type LiveByAgeSection = {
  kind: 'age'
  ages: Population[]
}

export type LiveByContentItem =
  | LiveByScalarMetric
  | LiveByDistributionGroup
  | LiveByAgeSection

export type LiveByDemographicsSection = {
  id: string
  title: string
  content: LiveByContentItem[]
  scalarColumns?: number
}
