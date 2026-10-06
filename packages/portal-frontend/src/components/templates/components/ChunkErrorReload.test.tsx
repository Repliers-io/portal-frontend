import { renderToStaticMarkup } from 'react-dom/server'

import { ChunkErrorReload } from './ChunkErrorReload'

// Test the artifact that actually ships: the inline source rendered into <head>.
const source = renderToStaticMarkup(<ChunkErrorReload />).replace(
  /^<script>|<\/script>$/g,
  ''
)

type Listener = (event: any) => void

/**
 * Run the script with its globals injected as parameters, so each case gets an
 * isolated window without touching the shared one.
 */
const boot = ({
  seed = {} as Record<string, string>,
  storageBlocked = false
} = {}) => {
  const store: Record<string, string> = { ...seed }
  const listeners: Record<string, Listener[]> = {}
  const timers: (() => void)[] = []
  let reloads = 0

  const throws = () => {
    throw new Error('blocked')
  }
  const storage = storageBlocked
    ? { getItem: throws, setItem: throws, removeItem: throws }
    : {
        getItem: (key: string) => (key in store ? store[key] : null),
        setItem: (key: string, value: string) => {
          store[key] = String(value)
        },
        removeItem: (key: string) => {
          delete store[key]
        }
      }

  new Function(
    'location',
    'sessionStorage',
    'addEventListener',
    'setTimeout',
    source
  )(
    {
      reload: () => {
        reloads++
      }
    },
    storage,
    (type: string, listener: Listener) => {
      listeners[type] = [...(listeners[type] ?? []), listener]
    },
    (timer: () => void) => timers.push(timer)
  )

  return {
    store,
    timers,
    reloads: () => reloads,
    fire: (type: string, event: unknown) =>
      listeners[type]?.forEach((listener) => listener(event))
  }
}

const chunkError = (url: string) => ({ target: { src: url } })

describe('ChunkErrorReload', () => {
  it('reloads when a build chunk is missing', () => {
    const page = boot()
    page.fire(
      'error',
      chunkError('https://www.movesmartly.com/_next/static/chunks/a.js?dpl=old')
    )

    expect(page.reloads()).toBe(1)
  })

  it('reloads when a dynamic import rejects', () => {
    const page = boot()
    page.fire('unhandledrejection', {
      reason: { name: 'ChunkLoadError', message: 'Loading chunk 42 failed.' }
    })

    expect(page.reloads()).toBe(1)
  })

  it('ignores failures that are not build assets', () => {
    const page = boot()
    page.fire('error', chunkError('https://widgetbe.com/agent'))
    page.fire('error', { target: { href: '/_next/image?url=%2Fa.png' } })
    page.fire('error', { target: undefined })
    page.fire('unhandledrejection', {
      reason: { name: 'TypeError', message: 'x is not a function' }
    })

    expect(page.reloads()).toBe(0)
  })

  // A chunk missing from the current build would otherwise reload forever.
  it('stops reloading once the cap is reached', () => {
    const page = boot()
    for (let attempt = 0; attempt < 10; attempt++) {
      page.fire('error', chunkError('/_next/static/chunks/a.js'))
    }

    expect(page.reloads()).toBe(2)
  })

  // Without a counter there is nothing to bound a loop, so it must stay put.
  it('never reloads when session storage is unavailable', () => {
    const page = boot({ storageBlocked: true })
    page.fire('error', chunkError('/_next/static/chunks/a.js'))

    expect(page.reloads()).toBe(0)
  })

  it('clears the counter once the page has survived', () => {
    const page = boot({ seed: { chunkReloadCount: '2' } })
    page.timers.forEach((timer) => timer())

    expect(page.store.chunkReloadCount).toBeUndefined()
  })
})
