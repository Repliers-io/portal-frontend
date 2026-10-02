import { type NextRequest, NextResponse } from 'next/server'

import { MoveSmartlyAPI } from 'services/MoveSmartly'

import { assertSameOrigin, parseQuery } from '../../_lib'
import { summaryQuerySchema } from '../schema'

export async function GET(request: NextRequest) {
  const forbidden = assertSameOrigin(request)
  if (forbidden) return forbidden

  const parsed = parseQuery(request, summaryQuerySchema)
  if (!parsed.ok) return parsed.response

  try {
    const summary = await MoveSmartlyAPI.fetchAgentReviewsSummary(
      parsed.value.agentId
    )
    return NextResponse.json(summary)
  } catch (err) {
    console.error('[GET /api/agent-reviews/summary]', err)
    return NextResponse.json(
      { error: 'Failed to fetch agent reviews summary' },
      { status: 500 }
    )
  }
}
