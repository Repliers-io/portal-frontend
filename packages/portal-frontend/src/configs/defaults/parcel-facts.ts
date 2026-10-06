import {
  mapperParcelAcres,
  mapperParcelArea,
  mapperParcelDate,
  mapperParcelPrice,
  mapperParcelText,
  type ParcelRecord
} from 'utils/dataMapper/parcelMappers'
import type { ResolverItem } from 'utils/dataMapper/types'

/**
 * The county assessor's facts about the parcel a listing stands on, shown under Home
 * Details wherever the parcel itself is drawn on the address map.
 *
 * A section of its own rather than a group inside `pdp-sections`: that file is copied
 * wholesale by tenants (see `configs/urbn/pdp-sections.ts`), so a new key added there
 * would be missing under every tenant that forked it. As its own file it falls back to
 * this one for everybody, and a tenant that wants a different set overrides the file.
 *
 * Every row is optional by nature — the record fills a different subset per county,
 * from four columns to ninety-two — and `filterEmptyGroups` drops the empty rows,
 * then the empty groups, then (in the section) the heading itself.
 */
const parcelFacts: {
  name: string
  groups: { title: string; items: ResolverItem<ParcelRecord>[] }[]
} = {
  name: 'PDP.sections.parcelFacts.name',
  groups: [
    {
      title: 'PDP.sections.parcelFacts.groups.parcel',
      items: [
        { label: 'PDP.fields.parcelNumber', path: 'apn' },
        {
          label: 'PDP.fields.lotSize',
          path: 'lotSizeSqft',
          fn: mapperParcelArea
        },
        {
          label: 'PDP.fields.acres',
          path: 'lotSizeAcres',
          fn: mapperParcelAcres
        },
        {
          label: 'PDP.fields.subdivision',
          path: 'subdivision',
          fn: mapperParcelText
        },
        { label: 'PDP.fields.zoning', path: 'zoningCode' },
        // Raw, unlike the subdivision above: a legal description is a quoted string
        // with its own punctuation ("CITY/MUNI/TWP:CITY OF AUSTIN UNT 1503 …"), and
        // title-casing it produces "City/muni/twp:city" rather than a sentence.
        { label: 'PDP.fields.legalDescription', path: 'legalDescriptionFull' }
      ]
    },
    {
      title: 'PDP.sections.parcelFacts.groups.transfer',
      items: [
        {
          label: 'PDP.fields.lastTransferDate',
          path: 'transferSaleDate',
          fn: mapperParcelDate
        },
        // Non-disclosure states (Texas among them) publish no price, and the record
        // says so with a '0' the empty-value rule drops.
        {
          label: 'PDP.fields.lastTransferPrice',
          path: 'salePriceLastTransfer',
          fn: mapperParcelPrice
        }
      ]
    },
    {
      title: 'PDP.sections.parcelFacts.groups.assessment',
      items: [
        {
          label: 'PDP.fields.assessedValue',
          path: 'assessedValue',
          fn: mapperParcelPrice
        },
        {
          label: 'PDP.fields.assessedLand',
          path: 'assessedLand',
          fn: mapperParcelPrice
        },
        {
          label: 'PDP.fields.assessedImprovements',
          path: 'assessedImprovement',
          fn: mapperParcelPrice
        },
        { label: 'PDP.fields.assessmentYear', path: 'assessedYear' },
        {
          label: 'PDP.fields.marketValue',
          path: 'marketValue',
          fn: mapperParcelPrice
        },
        { label: 'PDP.fields.marketValueYear', path: 'marketValueYear' },
        {
          label: 'PDP.fields.annualTax',
          path: 'taxAmount',
          fn: mapperParcelPrice
        },
        { label: 'PDP.fields.taxYear', path: 'taxYear' }
      ]
    }
  ]
}

export default parcelFacts
