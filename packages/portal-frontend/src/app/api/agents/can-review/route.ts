import { type NextRequest, NextResponse } from 'next/server'

import { MoveSmartlyAPI } from 'services/MoveSmartly'

import { assertSameOrigin } from '../../_lib'

export async function GET(request: NextRequest) {
  const forbidden = assertSameOrigin(request)
  if (forbidden) return forbidden

  try {
    const agents = await MoveSmartlyAPI.fetchCanReviewAgents()
    return NextResponse.json(agents)
  } catch (error) {
    console.error('[GET /api/agents/can-review]', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviewable agents' },
      { status: 500 }
    )
  }
}
