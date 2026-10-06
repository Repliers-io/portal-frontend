import {
  mapperParcelAcres,
  mapperParcelArea,
  mapperParcelDate,
  mapperParcelPrice,
  mapperParcelText,
  type ParcelRecord
} from './parcelMappers'

const record = {} as ParcelRecord

describe('parcel record mappers', () => {
  it('reads the assessor date format, which Date() would take for a timestamp', () => {
    expect(mapperParcelDate(record, '20250212')).toBe('Feb 12, 2025')
  })

  it('refuses anything that is not eight digits', () => {
    expect(mapperParcelDate(record, '2025-02-12')).toBeNull()
    expect(mapperParcelDate(record, '0')).toBeNull()
  })

  it('formats money and area, and drops the zeros the record uses for "nothing"', () => {
    expect(mapperParcelPrice(record, '3332895')).toBe('$3,332,895')
    expect(mapperParcelPrice(record, '0')).toBeNull()
    expect(mapperParcelArea(record, '3521')).toBe('3,521 sqft')
    expect(mapperParcelArea(record, '0')).toBeNull()
    expect(mapperParcelAcres(record, '0.012')).toBe('0.012 acres')
  })

  it('brings shouting assessor text back to a title case', () => {
    expect(mapperParcelText(record, 'INDEPENDENT CONDOMINIUMS')).toBe(
      'Independent Condominiums'
    )
  })
})
