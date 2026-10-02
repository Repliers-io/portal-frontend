import { type NextRequest, NextResponse } from 'next/server'

import { markdownToSafeHtml } from 'services/CMS'
import { MoveSmartlyAPI } from 'services/MoveSmartly'

import { assertSameOrigin } from '../_lib'

export async function GET(request: NextRequest) {
  const forbidden = assertSameOrigin(request)
  if (forbidden) return forbidden

  try {
    const careers = await MoveSmartlyAPI.fetchCareers()

    // Render markdown descriptions to sanitized HTML here so marked/sanitize-html
    // stay server-side and the client renders trusted markup without a sanitizer.
    const view = careers.map((career) => ({
      jobTitle: career.jobTitle,
      sortOrder: career.sortOrder,
      descriptionHtml: markdownToSafeHtml(career.jobDescription ?? '')
    }))

    return NextResponse.json(view)
  } catch (error) {
    console.error('[GET /api/career]', error)
    return NextResponse.json(
      { error: 'Failed to fetch careers' },
      { status: 500 }
    )
  }
}
