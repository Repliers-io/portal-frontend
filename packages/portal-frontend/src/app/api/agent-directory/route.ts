import { type NextRequest, NextResponse } from 'next/server'

import { MoveSmartlyAPI } from 'services/MoveSmartly'

import { assertSameOrigin } from '../_lib'

export async function GET(request: NextRequest) {
  const forbidden = assertSameOrigin(request)
  if (forbidden) return forbidden

  try {
    const agents = await MoveSmartlyAPI.fetchAgentDirectory()
    return NextResponse.json(agents)
  } catch (error) {
    console.error('[GET /api/agent-directory]', error)
    return NextResponse.json(
      { error: 'Failed to fetch agent directory' },
      { status: 500 }
    )
  }
}
