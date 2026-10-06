/** @jest-environment node */
const headersMock = jest.fn()
const storeMock = jest.fn()

jest.mock('next/headers', () => ({ headers: headersMock }))
jest.mock(
  'next/dist/server/app-render/work-unit-async-storage.external',
  () => ({ workUnitAsyncStorage: { getStore: storeMock } })
)

const loadXff = async () => {
  jest.resetModules()
  return import('./xff')
}

describe('getForwardedFrom', () => {
  const env = process.env

  beforeEach(() => {
    headersMock.mockReset()
    storeMock.mockReset().mockReturnValue({ type: 'request' })
    process.env = {
      ...env,
      NEXT_SSR_REQUEST_TOKEN: 'ssr-token',
      NEXT_SSG_REQUEST_TOKEN: 'ssg-token'
    }
  })

  afterAll(() => {
    process.env = env
  })

  it('forwards the chain with the SSR token for a real request', async () => {
    headersMock.mockResolvedValue(
      new Headers({ host: 'portal.test', 'x-forwarded-for': 'a, b, c' })
    )
    const { getForwardedFrom } = await loadXff()

    expect(await getForwardedFrom()).toEqual({
      token: 'ssr-token',
      from: 'ssr',
      xff: 'a, b, c'
    })
  })

  // force-static: headers() resolves to a truthy empty stub, so this render has
  // no user behind it and must not spend the production key.
  it('uses the SSG token when the headers stub carries no client IP', async () => {
    headersMock.mockResolvedValue(new Headers({}))
    const { getForwardedFrom } = await loadXff()

    expect(await getForwardedFrom()).toEqual({
      token: 'ssg-token',
      from: 'ssg',
      xff: undefined
    })
  })

  it('uses the SSG token in a static render without calling headers()', async () => {
    storeMock.mockReturnValue({ type: 'prerender-legacy' })
    const { getForwardedFrom } = await loadXff()

    expect(await getForwardedFrom()).toEqual({
      token: 'ssg-token',
      from: 'ssg',
      xff: undefined
    })
    // headers() there flips the route dynamic before it throws — a static route 500s.
    expect(headersMock).not.toHaveBeenCalled()
  })

  it('falls back to the SSG token when headers() rejects', async () => {
    headersMock.mockRejectedValue(new Error('no request scope'))
    const { getForwardedFrom } = await loadXff()

    expect(await getForwardedFrom()).toEqual({
      token: 'ssg-token',
      from: 'ssg',
      xff: undefined
    })
  })

  it('returns an empty token when the env var is unset', async () => {
    delete process.env.NEXT_SSG_REQUEST_TOKEN
    headersMock.mockResolvedValue(new Headers({}))
    const { getForwardedFrom } = await loadXff()

    expect((await getForwardedFrom())?.token).toBe('')
  })
})

describe('renderContext', () => {
  beforeEach(() => {
    headersMock.mockReset()
    storeMock.mockReset().mockReturnValue({ type: 'request' })
  })

  it('is ssr for a request with a host, ssg for the empty stub', async () => {
    headersMock.mockResolvedValue(new Headers({ host: 'portal.test' }))
    const { renderContext } = await loadXff()
    expect(await renderContext()).toBe('ssr')

    headersMock.mockResolvedValue(new Headers({}))
    const { renderContext: second } = await loadXff()
    expect(await second()).toBe('ssg')
  })

  it('is ssg in a static render, without calling headers()', async () => {
    storeMock.mockReturnValue({ type: 'prerender-legacy' })
    const { renderContext } = await loadXff()

    expect(await renderContext()).toBe('ssg')
    expect(headersMock).not.toHaveBeenCalled()
  })
})
