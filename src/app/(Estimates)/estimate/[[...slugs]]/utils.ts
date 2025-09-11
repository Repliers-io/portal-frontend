import type { PageProps } from './page'

export const parseEstimateParams = (
  params: PageProps['params'],
  searchParams: PageProps['searchParams']
) => {
  const { slugs = [] } = params
  // NOTE: we are using numbers for steps for now,
  // but there is a code to switch to step _labels_ in the future
  let step: string | number = Number(searchParams.step) || 0
  // placeholder for numerical estimateIds and ULIDs as strings
  let estimateId: string | number | undefined =
    Number(searchParams.estimateId) || searchParams.ulid || undefined
  const clientId = Number(params.clientId || searchParams.clientId) || undefined
  const signature = searchParams.s || undefined

  // Extract known estimate-related parameters
  // Note: knownParams contains 5 items but we return 4 structured params because:
  // - 'ulid' and 'estimateId' are mutually exclusive (both represent estimate ID)
  // - 's' is returned as 'signature' (renamed for clarity)
  const knownParams = new Set(['step', 'estimateId', 'ulid', 'clientId', 's'])

  // Collect all other query parameters (UTM, Google Analytics, etc.)
  const rest: Record<string, string> = {}
  Object.entries(searchParams).forEach(([key, value]) => {
    if (!knownParams.has(key) && value !== undefined) {
      rest[key] = value
    }
  })

  if (slugs.length > 0) {
    if (slugs.length === 2 && slugs[0] === 'step') {
      // /estimate/step/[step]
      step = Number(slugs[1])
      estimateId = undefined // Ensure estimateId is not carried over from searchParams if only step is in slug
    } else if (slugs.length === 1) {
      // /estimate/[estimateId]
      estimateId = slugs[0]
      // step might be in searchParams, retain it or default to 0 if not
      step = Number(searchParams.step) || 0
    } else if (slugs.length === 3 && slugs[1] === 'step') {
      // /estimate/[estimateId]/step/[step]
      estimateId = slugs[0]
      step = Number(slugs[2])
    }
  }
  return { step, estimateId, clientId, signature, rest }
}
