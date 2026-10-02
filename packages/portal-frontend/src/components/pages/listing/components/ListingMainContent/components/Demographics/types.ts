export type RegionComparison = {
  region: string
  value: string
}

export type Population = {
  label: string
  percentage: number
  color?: string
}

export type NumericStatistic = {
  type: 'numeric'
  title?: string
  value: string
  label: string
  comparisons: RegionComparison[]
}

export type CategoryItem = {
  name: string
  percentage: number
  countryCode?: string
}

export type CategoricalStatistic = {
  type: 'categorical'
  title: string
  items: CategoryItem[]
}

export type Statistics = NumericStatistic | CategoricalStatistic

export type DemographicsData = {
  name: string
  description: string
  ages: Population[]
  statistics: Statistics[]
}
