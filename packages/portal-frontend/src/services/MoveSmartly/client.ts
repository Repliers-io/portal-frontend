// Browser-side wrappers around the /api/* proxy routes that front MoveSmartlyAPI.
// Use these from 'use client' components. For Server Components and route
// handlers, import MoveSmartlyAPI directly — it talks to upstream without the
// proxy hop and uses Next.js fetch caching.

import queryString from 'query-string'

import {
  type AgentReviewCreateRequest,
  type AgentReviewModel,
  type AgentReviewsQuery,
  type AgentReviewsSummaryModel,
  type CareerViewModel,
  type DirectoryAgentModel,
  type ReviewAgentModel
} from './types'

const handle = async <T>(response: Response, label: string): Promise<T> => {
  if (!response.ok) {
    throw new Error(`[${label}] ${response.status}`)
  }
  return (await response.json()) as T
}

export const fetchCanReviewAgents = async (
  signal?: AbortSignal
): Promise<ReviewAgentModel[]> =>
  handle(
    await fetch('/api/agents/can-review', { signal }),
    '/api/agents/can-review'
  )

export const fetchAgentDirectory = async (
  signal?: AbortSignal
): Promise<DirectoryAgentModel[]> =>
  handle(
    await fetch('/api/agent-directory', { signal }),
    '/api/agent-directory'
  )

export const fetchCareers = async (
  signal?: AbortSignal
): Promise<CareerViewModel[]> =>
  handle(await fetch('/api/career', { signal }), '/api/career')

export const fetchAgentReviews = async (
  query: AgentReviewsQuery = {},
  signal?: AbortSignal
): Promise<AgentReviewModel[]> => {
  const qs = queryString.stringify(query, {
    skipNull: true,
    skipEmptyString: true
  })
  const path = `/api/agent-reviews${qs ? `?${qs}` : ''}`
  return handle(await fetch(path, { signal }), path)
}

export const fetchAgentReviewsSummary = async (
  agentId?: number,
  signal?: AbortSignal
): Promise<AgentReviewsSummaryModel> => {
  const qs = queryString.stringify(
    { agentId },
    { skipNull: true, skipEmptyString: true }
  )
  const path = `/api/agent-reviews/summary${qs ? `?${qs}` : ''}`
  return handle(await fetch(path, { signal }), path)
}

export const createAgentReview = async (
  data: AgentReviewCreateRequest
): Promise<void> => {
  const response = await fetch('/api/agent-reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) {
    throw new Error(`[/api/agent-reviews POST] ${response.status}`)
  }
}
