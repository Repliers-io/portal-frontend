import dayjs from 'dayjs'

import utc from 'dayjs/plugin/utc'

import { type ApiListing } from 'services/API'
import {
  formatDate,
  formatEnglishNumber,
  formatEnglishPrice,
  type Primitive,
  toSafeNumber
} from 'utils/formatters'
import { sold, soldDate } from 'utils/listings'
import { SQFT_PER_ACRE } from 'utils/numbers'
import { addSpaceAfterComma, joinNonEmpty, pluralize } from 'utils/strings'

import {
  isEmptyValue,
  sanitizeItems,
  sanitizeStringWithDelimiter
} from './utils'

const joinWithSlash = (a: Primitive, b: Primitive) =>
  joinNonEmpty([a, b], ' / ')

dayjs.extend(utc)

/**
 * Custom mappers for Property type
 */

export function mapperCategory(listing: ApiListing) {
  return listing.class?.replace('Property', '') ?? null
}

export function mapperDaysOnMarket(listing: ApiListing) {
  const isNew = listing.lastStatus === 'New'
  if (!sold(listing)) {
    const date = isNew ? listing.listDate : listing.soldDate
    const days = dayjs().diff(date, 'day') || 0
    return pluralize(days, {
      zero: 'listed today',
      one: '$ day ago',
      many: '$ days ago'
    })
  }
  return null
}

export function mapperListDate(listing: ApiListing) {
  if (sold(listing) && listing.type !== 'Lease') return null
  return formatDate(listing.listDate, { utc: true })
}

export function mapperSoldDate(listing: ApiListing) {
  return formatDate(soldDate(listing), { utc: true })
}

export function mapperListingUpdatedOn(listing: ApiListing) {
  return formatDate(listing.updatedOn, { utc: true })
}

// Mappers that render a date — detail rows built from these mask a scrubbed value
// with the date-shaped placeholder instead of the generic one (see createResolver).
// Membership is all the resolver asks, and it resolves sections built on other
// sources too, so the set is not typed to the listing mapper signature.
export const dateMappers = new Set<unknown>([
  mapperListDate,
  mapperSoldDate,
  mapperListingUpdatedOn
])

export function mapperSecondaryDwellingUnit(listing: ApiListing) {
  const value = listing.raw?.HasSecondaryDwellingUnitYN
  return typeof value === 'undefined'
    ? null
    : Number(value) === 0
      ? 'No'
      : 'Yes'
}

export function mapperBuilderModel(listing: ApiListing) {
  const builderName = listing.raw?.BuilderName
  const modelName = listing.raw?.ModelName
  return joinNonEmpty([builderName, modelName], ' / ') || null
}

export function mapperLotSize(listing: ApiListing) {
  const frontage = listing.raw?.LotSizeImpFrontage
  const depth = listing.raw?.LotSizeImpDepth
  if (frontage && depth) {
    const value = (+frontage * +depth) / SQFT_PER_ACRE
    const formattedValue = parseFloat(value.toFixed(2))
    return !isEmptyValue(formattedValue) ? `${formattedValue} acres` : null
  }
  return null
}

// "frontage x depth" from listing.lot; pass fractionDigits 0 to drop decimals
export function mapperLotDimensions(
  listing: ApiListing,
  fractionDigits?: number
) {
  const { width, depth } = listing.lot ?? {}
  return width && depth
    ? `${formatEnglishNumber(width, fractionDigits)}x${formatEnglishNumber(depth, fractionDigits)}`
    : null
}

// Lot area in sqft, derived from width*depth or acres
export function mapperLotArea(listing: ApiListing, fractionDigits?: number) {
  const { width, depth, acres } = listing.lot ?? {}
  const sqft =
    width && depth
      ? width * depth
      : acres
        ? Number(acres) * SQFT_PER_ACRE
        : null
  return sqft != null
    ? `${formatEnglishNumber(sqft, fractionDigits)} sqft`
    : null
}

export function mapperSquareFeet(listing: ApiListing, fractionDigits?: number) {
  const { sqft } = listing.details ?? {}
  return sqft ? `${formatEnglishNumber(sqft, fractionDigits)} sqft` : null
}

export function mapperTaxesYear(listing: ApiListing, fractionDigits?: number) {
  const { annualAmount, assessmentYear } = listing.taxes || {}
  return joinWithSlash(
    annualAmount
      ? formatEnglishPrice(Number(annualAmount), fractionDigits)
      : '',
    assessmentYear
  )
}

export function mapperAssociationFeePOTL(listing: ApiListing) {
  const feeAmt = listing.raw?.AssocCommonAreaFeeAmt
  const feeFreq = listing.raw?.AssocFeeFrequency
  const value = joinWithSlash(feeAmt, feeFreq)
  return !isEmptyValue(value) ? `$${value}` : null
}

export function mapperSizeEstimated() {
  // const sqft = getSqft(properties)
  //
  // return sqft.label

  // force hide Size (estimated) for now
  return null
}

export function mapperTotalBeds(listing: ApiListing) {
  const { numBedrooms, numBedroomsPlus } = listing.details
  return joinNonEmpty([+numBedrooms, +numBedroomsPlus], ' + ')
}

export function mapperBaths(listing: ApiListing) {
  const { numBathrooms, numBathroomsPlus } = listing.details
  return joinNonEmpty([+numBathrooms, +numBathroomsPlus], ' + ')
}

export function mapperTotalParking(listing: ApiListing) {
  // Total = garage + driveway (the two additive components). Summed from the two
  // shown parts rather than the API's numParkingSpaces so the total always
  // reconciles with the "Garage spots" / "Driveway spots" rows beside it. A 0
  // total renders as empty (isEmptyValue) and is hidden.
  const { numGarageSpaces, numDrivewaySpaces } = listing.details
  return toSafeNumber(numGarageSpaces) + toSafeNumber(numDrivewaySpaces)
}

export function mapperAppliancesIncluded(listing: ApiListing) {
  const appliances = listing.raw?.AppliancesIncluded
  return sanitizeStringWithDelimiter(appliances)
}

export function mapperExclusions(listing: ApiListing) {
  const exclusions = listing.raw?.Exclusions
  return sanitizeStringWithDelimiter(exclusions, /[,&]/)
}

export function mapperFeaturesEquipmentIncluded(listing: ApiListing) {
  const features = listing.raw?.FeaturesEquipmentIncluded
  return sanitizeStringWithDelimiter(features)
}

export function mapperRentalEquipment(listing: ApiListing) {
  const rentalEquipment = listing.raw?.RentalEquipment
  if (rentalEquipment) {
    const input = rentalEquipment.split(/\r?\n/)
    return input
      .map((line) => {
        if (/Water Heater|Hot Water Tank/.test(line)) return 'HWT'
        if (/Water Softener/.test(line)) return 'Furnace'
        if (/AC/.test(line)) return 'AC'
        return null
      })
      .filter(Boolean)
  }
  return null
}

export function mapperNeighborhoodInfluences(listing: ApiListing) {
  const { ammenities } = listing.nearby || {}
  return sanitizeItems(ammenities)
}

export function mapperNearbyAmenities(listing: ApiListing) {
  return sanitizeItems(listing.nearby?.amenities ?? listing.nearby?.ammenities)
}

export function mapperConstructionYearBuilt(listing: ApiListing) {
  const { yearBuilt } = listing.details
  const ageDescription = listing.raw?.AgeDescription
  return yearBuilt && !isEmptyValue(yearBuilt)
    ? `${yearBuilt} ${ageDescription || ''}`.replace('Unknown', '').trim()
    : null
}

export function mapperAcres(listing: ApiListing) {
  return mapperLotSize(listing)
}

export function mapperFrontageFt(listing: ApiListing) {
  const frontage = listing.raw?.LotSizeImpFrontage
  return frontage && !isEmptyValue(frontage)
    ? `${Math.floor(+frontage)} ft`
    : null
}

export function mapperDepthFt(listing: ApiListing) {
  const depth = listing.raw?.LotSizeImpDepth
  return depth && !isEmptyValue(depth) ? `${Math.floor(+depth)} ft` : null
}

export function mapperSpecialAssessment(listing: ApiListing) {
  const year = listing.raw?.AssessmentYear
  const amount = listing.raw?.AssessmentAmount
  return joinNonEmpty([year, amount], ' / ') || null
}

export function mapperLaundry(listing: ApiListing) {
  const { ensuiteLaundry } = listing.condominium || {}
  const laundryFacilities = listing.raw?.LaundryFacilities
  return joinNonEmpty([ensuiteLaundry, laundryFacilities], ' | ') || null
}

export function mapperCCPName(listing: ApiListing) {
  const { condoCorp, condoCorpNum } = listing.condominium || {}
  return joinNonEmpty([condoCorpNum, condoCorp], ' / ') || null
}

export function mapperLevelsUnit(listing: ApiListing) {
  const levels = listing.raw?.NumberofLevelsInUnit

  if (!levels) return null

  const roundDown = Math.floor(+levels)
  return !Number.isNaN(roundDown) ? roundDown : null
}

export function mapperSpaceAfterComma(listing: ApiListing, key: string) {
  const value = listing.raw?.[key]
  return value ? addSpaceAfterComma(value) : null
}

export function mapperFloorCovering(listing: ApiListing) {
  return mapperSpaceAfterComma(listing, 'FloorCovering')
}

export function mapperParkingDescription(listing: ApiListing) {
  return mapperSpaceAfterComma(listing, 'ParkingDesc')
}

export function mapperFeeIncludes(listing: ApiListing) {
  return mapperSpaceAfterComma(listing, 'FeeIncludes')
}

/**
 * TRREB ships its inclusion picklists as string arrays, unlike the rest of `raw`, and
 * suffixes every sale value with " Included" — redundant under an "Includes" label.
 * `"None"` is its explicit nothing-is-included value; the row is dropped instead.
 */
function mapperIncludesList(listing: ApiListing, key: string) {
  const items = sanitizeItems(listing.raw?.[key] as string[] | undefined)
  const included = items
    ?.filter((item) => item !== 'None')
    .map((item) => item.replace(/ Included$/, ''))

  return included?.length ? included.join(', ') : null
}

/** Sale listings — what the condo maintenance fee covers. */
export function mapperAssociationFeeIncludes(listing: ApiListing) {
  return mapperIncludesList(listing, 'AssociationFeeIncludes')
}

/** Lease listings — what the rent covers. Never set alongside the fee inclusions. */
export function mapperRentIncludes(listing: ApiListing) {
  return mapperIncludesList(listing, 'RentIncludes')
}

export function mapperExterior(listing: ApiListing) {
  const exterior = listing.details?.exteriorConstruction1
  return exterior ? addSpaceAfterComma(exterior) : null
}

export function mapperParkingType(listing: ApiListing) {
  const { parkingType } = listing?.condominium || {}
  return parkingType ? addSpaceAfterComma(parkingType) : null
}

export function mapperCondoFees(listing: ApiListing, fractionDigits?: number) {
  const { maintenance } = listing?.condominium?.fees || {}
  const condoFeeFrequency = listing.raw?.CondoFeeFrequency

  if (!maintenance) return null

  const value = parseFloat(maintenance)
  if (Number.isNaN(value)) return null

  // Default branch preserves the original "$250.00" -> "$250" behaviour for
  // every other tenant; pass fractionDigits (e.g. 0) to force a fixed precision
  const formatted =
    fractionDigits === undefined
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        })
          .format(value)
          .replace('.00', '')
      : formatEnglishPrice(value, fractionDigits)

  return joinNonEmpty([formatted, condoFeeFrequency], ' / ')
}

export const mapperBasementDevelopment = (listing: ApiListing) =>
  listing.details.basement2 === 'W/O' ? 'Walk-Out' : listing.details.basement2

export function mapperCondoAmenities(listing: ApiListing) {
  return sanitizeItems(
    listing.condominium?.amenities ?? listing.condominium?.ammenities
  )
}
