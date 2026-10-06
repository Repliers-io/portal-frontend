import { parsePoint, serializePoint } from './point'

describe('parsePoint', () => {
  it('parses a coordinate-only point', () => {
    expect(parsePoint('[43.65,-79.38]')).toEqual({ center: [43.65, -79.38] })
  })

  it('parses a point with radius', () => {
    expect(parsePoint('[43.65,-79.38,5]')).toEqual({
      center: [43.65, -79.38],
      radius: 5
    })
  })

  it('returns undefined for missing or malformed input', () => {
    expect(parsePoint(undefined)).toBeUndefined()
    expect(parsePoint('nonsense')).toBeUndefined()
    expect(parsePoint('[1]')).toBeUndefined()
  })
})

describe('serializePoint', () => {
  it('serializes a coordinate-only point', () => {
    expect(serializePoint({ center: [43.65, -79.38] })).toBe('[43.65,-79.38]')
  })

  it('serializes a point with radius', () => {
    expect(serializePoint({ center: [43.65, -79.38], radius: 5 })).toBe(
      '[43.65,-79.38,5]'
    )
  })

  it('drops the label', () => {
    expect(
      serializePoint({ center: [43.65, -79.38], label: '123 Main St' })
    ).toBe('[43.65,-79.38]')
  })

  it('round-trips through parsePoint', () => {
    const point = { center: [43.65, -79.38] as [number, number], radius: 3 }
    expect(parsePoint(serializePoint(point))).toEqual(point)
  })
})
