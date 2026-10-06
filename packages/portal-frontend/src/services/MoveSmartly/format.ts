// Display formatters for MoveSmartly API types.
// Use these wherever raw API fields need humanised strings.

import { type AgentReviewBoughtSold, type AgentReviewModel } from './types'

export const formatAgentName = (agent: {
  firstName: string
  lastName: string
}): string => `${agent.firstName} ${agent.lastName}`.trim()

export const formatReviewDate = (iso: string): string => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

const boughtSoldVerb: Record<AgentReviewBoughtSold, string> = {
  Bought: 'Bought',
  Sold: 'Sold',
  BoughtAndSold: 'Bought and sold',
  // Wire value stays 'Leased'; this tenant displays a rental as rented.
  Leased: 'Rented'
}

export const formatTransaction = (
  review: Pick<AgentReviewModel, 'boughtSold' | 'neighbourhood'>
): string => {
  const verb = boughtSoldVerb[review.boughtSold]
  return review.neighbourhood ? `${verb} in ${review.neighbourhood}` : verb
}
