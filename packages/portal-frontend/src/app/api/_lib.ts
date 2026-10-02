import { type NextRequest, NextResponse } from 'next/server'
import type Joi from 'joi'
import { isIP } from 'node:net'

const baseUrl = process.env.NEXT_PUBLIC_APP_DOMAIN || ''

// Resolves the client IPv4 from forwarded headers, or `127.0.0.1` when
// no proxy is in front (local dev). Required by upstream's `PostIpAddress`.
export const getClientIp = (request: NextRequest): string => {
  const raw =
    request.headers.get('x-forwarded-for')?.split(',').pop()?.trim() ||
    request.headers.get('x-real-ip') ||
    ''
  const candidate = raw.startsWith('::ffff:') ? raw.slice(7) : raw
  return isIP(candidate) === 4 ? candidate : '127.0.0.1'
}

// Referer-based same-origin guard. Returns a 403 response when the request
// comes from an external origin, or null when allowed to proceed. When
// NEXT_PUBLIC_APP_DOMAIN is unset (e.g. local dev) the guard is disabled.
export const assertSameOrigin = (request: NextRequest): NextResponse | null => {
  const referer = request.headers.get('referer')
  if (baseUrl && !referer?.startsWith(baseUrl)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return null
}

export const validationErrorResponse = (
  error: Joi.ValidationError,
  message = 'Validation failed'
): NextResponse =>
  NextResponse.json(
    {
      error: message,
      details: error.details.map((d) => ({
        path: d.path.join('.'),
        message: d.message
      }))
    },
    { status: 400 }
  )

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; response: NextResponse }

export const parseQuery = <T>(
  request: NextRequest,
  schema: Joi.ObjectSchema<T>
): ParseResult<T> => {
  const queryObj = Object.fromEntries(request.nextUrl.searchParams)
  const { error, value } = schema.validate(queryObj, { abortEarly: false })
  if (error) {
    return {
      ok: false,
      response: validationErrorResponse(error, 'Invalid query parameters')
    }
  }
  return { ok: true, value }
}

export const parseBody = async <T>(
  request: NextRequest,
  schema: Joi.ObjectSchema<T>
): Promise<ParseResult<T>> => {
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      )
    }
  }
  const { error, value } = schema.validate(body, { abortEarly: false })
  if (error) {
    return { ok: false, response: validationErrorResponse(error) }
  }
  return { ok: true, value }
}
