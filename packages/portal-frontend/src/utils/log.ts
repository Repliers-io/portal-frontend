/* eslint-disable no-console */
import { ApiError } from 'services/API/APIBase'

import { renderContext } from './xff'

// An ApiError message already carries the status and the full upstream payload,
// so the console form adds only noise: a stack that is always fetchJSON → this
// call site, plus a re-print of `status`/`data` with nested fields collapsed to
// [Object]. Other errors keep their stack — there it is the only clue.
const compact = (arg: unknown) =>
  arg instanceof ApiError ? `${arg.name}: ${arg.message}` : arg

const write = (level: 'error' | 'warn') => {
  return (...args: unknown[]) => {
    const parts = args.map(compact)
    // Browser logs need no headers lookup — tag synchronously so call order
    // (and test spies) see the entry immediately.
    if (typeof window !== 'undefined') return console[level]('[csr]', ...parts)
    void renderContext().then((from) => console[level](`[${from}]`, ...parts))
  }
}

export const logError = write('error')
export const logWarn = write('warn')
