export type EstimateRouteParams = {
  slugs?: string[]
  clientId?: string
}

export type EstimateRouteSearchParams = {
  ulid?: string
  estimateId?: string
  clientId?: string
  step?: string
  s?: string
  [key: string]: string | undefined
}

export type EstimateParamsInput = {
  params: EstimateRouteParams
  searchParams: EstimateRouteSearchParams
}
