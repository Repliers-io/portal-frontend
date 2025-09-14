import dayjs from 'dayjs'

import utc from 'dayjs/plugin/utc'

import { type Property } from 'services/API'
import {
  formatDate,
  formatEnglishPrice,
  type Primitive
} from 'utils/formatters'
import { SQFT_PER_ACRE } from 'utils/numbers'
import { sold } from 'utils/properties'
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

export function mapperCategory(property: Property) {
  return property.class?.replace('Property', '') ?? null
}

export function mapperDaysOnMarket(property: Property) {
  const isNew = property.lastStatus === 'New'
  if (!sold(property)) {
    const date = isNew ? property.listDate : property.soldDate
    const days = dayjs().diff(date, 'day') || 0
    return pluralize(days, {
      zero: 'listed today',
      one: '$ day ago',
      many: '$ days ago'
    })
  }
  return null
}

export function mapperListDate(property: Property) {
  if (sold(property) && property.type !== 'Lease') return null
  return formatDate(property.listDate, { utc: true })
}

export function mapperSoldDate(property: Property) {
  return formatDate(property.soldDate, { utc: true })
}

export function mapperListingUpdatedOn(property: Property) {
  return formatDate(property.updatedOn, { utc: true })
}

export function mapperSecondaryDwellingUnit(property: Property) {
  const value = property.raw?.HasSecondaryDwellingUnitYN
  return typeof value === 'undefined'
    ? null
    : Number(value) === 0
      ? 'No'
      : 'Yes'
}

export function mapperBuilderModel(property: Property) {
  const builderName = property.raw?.BuilderName
  const modelName = property.raw?.ModelName
  return joinNonEmpty([builderName, modelName], ' / ') || null
}

export function mapperLotSize(property: Property) {
  const frontage = property.raw?.LotSizeImpFrontage
  const depth = property.raw?.LotSizeImpDepth
  if (frontage && depth) {
    const value = (+frontage * +depth) / SQFT_PER_ACRE
    const formattedValue = parseFloat(value.toFixed(2))
    return !isEmptyValue(formattedValue) ? `${formattedValue} acres` : null
  }
  return null
}

export function mapperTaxesYear(property: Property) {
  const { annualAmount, assessmentYear } = property.taxes || {}
  return joinWithSlash(
    annualAmount ? formatEnglishPrice(Number(annualAmount)) : '',
    assessmentYear
  )
}

export function mapperAssociationFeePOTL(property: Property) {
  const feeAmt = property.raw?.AssocCommonAreaFeeAmt
  const feeFreq = property.raw?.AssocFeeFrequency
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

export function mapperTotalBeds(property: Property) {
  const { numBedrooms, numBedroomsPlus } = property.details
  return joinNonEmpty([+numBedrooms, +numBedroomsPlus], ' + ')
}

export function mapperBaths(property: Property) {
  const { numBathrooms, numBathroomsPlus } = property.details
  return joinNonEmpty([+numBathrooms, +numBathroomsPlus], ' + ')
}

export function mapperTotalParking(property: Property) {
  const { numParkingSpaces, numGarageSpaces } = property.details
  return joinNonEmpty([+numGarageSpaces, +numParkingSpaces], ' + ')
}

export function mapperAppliancesIncluded(property: Property) {
  const appliances = property.raw?.AppliancesIncluded
  return sanitizeStringWithDelimiter(appliances)
}

export function mapperExclusions(property: Property) {
  const exclusions = property.raw?.Exclusions
  return sanitizeStringWithDelimiter(exclusions, /[,&]/)
}

export function mapperFeaturesEquipmentIncluded(property: Property) {
  const features = property.raw?.FeaturesEquipmentIncluded
  return sanitizeStringWithDelimiter(features)
}

export function mapperRentalEquipment(property: Property) {
  const rentalEquipment = property.raw?.RentalEquipment
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

export function mapperNeighborhoodInfluences(property: Property) {
  const { ammenities } = property.nearby || {}
  return sanitizeItems(ammenities)
}

export function mapperConstructionYearBuilt(property: Property) {
  const { yearBuilt } = property.details
  const ageDescription = property.raw?.AgeDescription
  return yearBuilt && !isEmptyValue(yearBuilt)
    ? `${yearBuilt} ${ageDescription || ''}`.replace('Unknown', '').trim()
    : null
}

export function mapperAcres(property: Property) {
  return mapperLotSize(property)
}

export function mapperFrontageFt(property: Property) {
  const frontage = property.raw?.LotSizeImpFrontage
  return frontage && !isEmptyValue(frontage)
    ? `${Math.floor(+frontage)} ft`
    : null
}

export function mapperDepthFt(property: Property) {
  const depth = property.raw?.LotSizeImpDepth
  return depth && !isEmptyValue(depth) ? `${Math.floor(+depth)} ft` : null
}

export function mapperSpecialAssessment(property: Property) {
  const year = property.raw?.AssessmentYear
  const amount = property.raw?.AssessmentAmount
  return joinNonEmpty([year, amount], ' / ') || null
}

export function mapperLaundry(property: Property) {
  const { ensuiteLaundry } = property.condominium || {}
  const laundryFacilities = property.raw?.LaundryFacilities
  return joinNonEmpty([ensuiteLaundry, laundryFacilities], ' | ') || null
}

export function mapperCCPName(property: Property) {
  const { condoCorp, condoCorpNum } = property.condominium || {}
  return joinNonEmpty([condoCorpNum, condoCorp], ' / ') || null
}

export function mapperLevelsUnit(property: Property) {
  const levels = property.raw?.NumberofLevelsInUnit

  if (!levels) return null

  const roundDown = Math.floor(+levels)
  return !Number.isNaN(roundDown) ? roundDown : null
}

export function mapperSpaceAfterComma(property: Property, key: string) {
  const value = property.raw?.[key]
  return value ? addSpaceAfterComma(value) : null
}

export function mapperFloorCovering(property: Property) {
  return mapperSpaceAfterComma(property, 'FloorCovering')
}

export function mapperParkingDescription(property: Property) {
  return mapperSpaceAfterComma(property, 'ParkingDesc')
}

export function mapperFeeIncludes(property: Property) {
  return mapperSpaceAfterComma(property, 'FeeIncludes')
}

export function mapperExterior(property: Property) {
  const exterior = property.details?.exteriorConstruction1
  return exterior ? addSpaceAfterComma(exterior) : null
}

export function mapperParkingType(property: Property) {
  const { parkingType } = property?.condominium || {}
  return parkingType ? addSpaceAfterComma(parkingType) : null
}

export function mapperCondoFees(property: Property) {
  const { maintenance } = property?.condominium?.fees || {}
  const condoFeeFrequency = property.raw?.CondoFeeFrequency

  if (maintenance) {
    const rounded = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })
      .format(parseFloat(maintenance))
      .replace('.00', '')
    return !rounded.includes('NaN')
      ? joinNonEmpty([rounded, condoFeeFrequency], ' / ')
      : null
  }
  return null
}

export const mapperBasementDevelopment = (property: Property) =>
  property.details.basement2 === 'W/O' ? 'Walk-Out' : property.details.basement2
