import { revalidatePath } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

import rewritesJson from '../../../../rewrites.generated.json'

/**
 * On-demand ISR revalidation endpoint.
 *
 * Usage:
 *   GET  /api/revalidate?path=/page/my-slug&token=<REVALIDATE_TOKEN>
 *   POST /api/revalidate  { "path": "/page/my-slug", "token": "<REVALIDATE_TOKEN>" }
 *
 * GET:  redirects to the revalidated page on success.
 * POST: returns JSON { revalidated: true, path, revalidatedPaths } on success.
 *
 * Rewrite-aware: if the given path matches a rewrite source or destination,
 * all related paths are revalidated so both the canonical and aliased URLs
 * are cleared from cache.
 *
 * Set REVALIDATE_TOKEN in the tenant .env file.
 * If the env var is not set, the endpoint is disabled.
 */

type Rewrite = { source: string; destination: string }

const rewrites: Rewrite[] = rewritesJson

/** Convert a Next.js route pattern to a RegExp + ordered param names. */
function patternToRegex(pattern: string): { regex: RegExp; params: string[] } {
  const params: string[] = []
  const regexStr = pattern
    .split(/(:[\w]+\*?)/g)
    .map((part) => {
      const catchAll = part.match(/^:(\w+)\*$/)
      if (catchAll) {
        params.push(catchAll[1])
        return '(.*)'
      }
      const single = part.match(/^:(\w+)$/)
      if (single) {
        params.push(single[1])
        return '([^/]+)'
      }
      return part.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`)
    })
    .join('')
  return { regex: new RegExp(`^${regexStr}$`), params }
}

function matchPattern(
  input: string,
  pattern: string
): Record<string, string> | null {
  const { regex, params } = patternToRegex(pattern)
  const m = input.match(regex)
  if (!m) return null
  return Object.fromEntries(params.map((name, i) => [name, m[i + 1] ?? '']))
}

function substitutePattern(
  template: string,
  paramValues: Record<string, string>
): string {
  return template
    .replace(/:(\w+)\*/g, (_, name: string) => paramValues[name] ?? '')
    .replace(/:(\w+)/g, (_, name: string) => paramValues[name] ?? '')
}

/**
 * Given a path, return all paths that should be revalidated,
 * following rewrite source↔destination relationships in both directions.
 */
function resolveRewritePaths(inputPath: string, rewrites: Rewrite[]): string[] {
  const paths = new Set([inputPath])
  for (const { source, destination } of rewrites) {
    const fromSource = matchPattern(inputPath, source)
    if (fromSource) paths.add(substitutePattern(destination, fromSource))

    const fromDest = matchPattern(inputPath, destination)
    if (fromDest) paths.add(substitutePattern(source, fromDest))
  }
  return Array.from(paths)
}

function validateRevalidateInputs(
  token: string | null,
  path: string | null
): { error: string; status: number } | { safePath: string } {
  const expectedSecret = process.env.REVALIDATE_TOKEN

  if (!expectedSecret) {
    return {
      error: 'Revalidation is not configured on this instance.',
      status: 503
    }
  }

  if (!token || token !== expectedSecret) {
    return { error: 'Unauthorized.', status: 401 }
  }

  // Validate path: must start with '/', no '..' traversal, safe chars only
  const safePath =
    typeof path === 'string' &&
    path.startsWith('/') &&
    !path.includes('..') &&
    /^[/\w.-]{1,300}$/.test(path)
      ? path
      : null

  if (!safePath) {
    return {
      error:
        'Invalid path. Must start with "/" and contain only letters, numbers, hyphens, underscores, and slashes.',
      status: 400
    }
  }

  return { safePath }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const result = validateRevalidateInputs(
    searchParams.get('token'),
    searchParams.get('path')
  )

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  resolveRewritePaths(result.safePath, rewrites).forEach((p) =>
    revalidatePath(p)
  )
  return NextResponse.redirect(new URL(result.safePath, request.nextUrl.origin))
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const result = validateRevalidateInputs(
    typeof body.token === 'string' ? body.token : null,
    typeof body.path === 'string' ? body.path : null
  )

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  const revalidatedPaths = resolveRewritePaths(result.safePath, rewrites)
  revalidatedPaths.forEach((p) => revalidatePath(p))
  return NextResponse.json({
    revalidated: true,
    path: result.safePath,
    revalidatedPaths
  })
}
