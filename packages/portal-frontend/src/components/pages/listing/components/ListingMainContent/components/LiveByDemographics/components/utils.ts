export const formatPercentage = (percentage: number): string =>
  percentage > 0 && percentage < 1 ? '<1%' : `${Math.round(percentage)}%`
