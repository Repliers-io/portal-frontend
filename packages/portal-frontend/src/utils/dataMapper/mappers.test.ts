import { type ApiListing } from 'services/API'

import {
  mapperAcres,
  mapperAppliancesIncluded,
  mapperAssociationFeeIncludes,
  mapperAssociationFeePOTL,
  mapperBaths,
  mapperBuilderModel,
  mapperCategory,
  mapperCCPName,
  mapperCondoFees,
  mapperConstructionYearBuilt,
  mapperDaysOnMarket,
  mapperDepthFt,
  mapperExclusions,
  mapperExterior,
  mapperFeaturesEquipmentIncluded,
  mapperFeeIncludes,
  mapperFloorCovering,
  mapperFrontageFt,
  mapperLaundry,
  mapperLevelsUnit,
  mapperListDate,
  mapperListingUpdatedOn,
  mapperLotArea,
  mapperLotDimensions,
  mapperLotSize,
  mapperNeighborhoodInfluences,
  mapperParkingDescription,
  mapperParkingType,
  mapperRentalEquipment,
  mapperRentIncludes,
  mapperSecondaryDwellingUnit,
  mapperSoldDate,
  mapperSpaceAfterComma,
  mapperSpecialAssessment,
  mapperSquareFeet,
  mapperTaxesYear,
  mapperTotalBeds,
  mapperTotalParking
} from './mappers'

describe('mapperCategory', () => {
  it('should return the class without "Property" if class is defined', () => {
    const listing = {
      class: 'ResidentialProperty'
    } as ApiListing

    const result = mapperCategory(listing)
    expect(result).toBe('Residential')
  })

  it('should return null if class is not defined', () => {
    const listing: ApiListing = {} as ApiListing

    const result = mapperCategory(listing)
    expect(result).toBeNull()
  })
})

describe('mapperDaysOnMarket', () => {
  it('should contains number of days ago for unsold property', () => {
    const listing: ApiListing = {
      lastStatus: 'New',
      listDate: '2024-09-30T00:00:00.000Z',
      soldDate: null
    } as unknown as ApiListing

    const result = mapperDaysOnMarket(listing)
    expect(result).toContain('days ago')
  })

  it('should return null if the property is sold', () => {
    const listing: ApiListing = {
      lastStatus: 'Sld',
      listDate: '2023-06-09T00:00:00.000Z',
      soldDate: '2023-06-12T00:00:00.000Z'
    } as unknown as ApiListing

    const result = mapperDaysOnMarket(listing)
    expect(result).toBeNull()
  })
})

describe('mapperListDate', () => {
  it('should return formatted listDate if property is not sold', () => {
    const listing: ApiListing = {
      lastStatus: 'New',
      listDate: '2023-06-09T00:00:00.000Z',
      soldDate: null
    } as unknown as ApiListing

    expect(mapperListDate(listing)).toBe('Jun 9, 2023')
  })

  it('should return null if property is sold and type is not Lease', () => {
    const listing: ApiListing = {
      lastStatus: 'Sold',
      listDate: '2023-06-09T00:00:00.000Z',
      soldDate: '2023-06-12T00:00:00.000Z',
      type: 'Sale'
    } as unknown as ApiListing

    expect(mapperListDate(listing)).toBeNull()
  })

  it('should return formatted listDate if property is sold and type is Lease', () => {
    const listing: ApiListing = {
      lastStatus: 'Sold',
      listDate: '2023-06-09T00:00:00.000Z',
      soldDate: '2023-06-12T00:00:00.000Z',
      type: 'Lease'
    } as unknown as ApiListing

    expect(mapperListDate(listing)).toBe('Jun 9, 2023')
  })

  it('should return null if listDate is not provided', () => {
    const listing: ApiListing = {
      lastStatus: 'Active',
      listDate: null,
      soldDate: null
    } as unknown as ApiListing

    const result = mapperListDate(listing)
    expect(result).toBeNull()
  })
})

describe('mapperSoldDate', () => {
  it('should return formatted soldDate if soldDate is provided', () => {
    const listing: ApiListing = {
      soldDate: '2023-06-12T00:00:00.000Z'
    } as unknown as ApiListing

    const result = mapperSoldDate(listing)
    expect(result).toBe('Jun 12, 2023')
  })

  it('should return null if soldDate is not provided', () => {
    const listing: ApiListing = {
      soldDate: null
    } as unknown as ApiListing

    const result = mapperSoldDate(listing)
    expect(result).toBeNull()
  })
})

describe('mapperListingUpdatedOn', () => {
  it('should return formatted updatedOn date', () => {
    const listing: ApiListing = {
      updatedOn: '2023-06-14T00:00:00.000Z'
    } as unknown as ApiListing

    const result = mapperListingUpdatedOn(listing)
    expect(result).toBe('Jun 14, 2023')
  })
})

describe('mapperSecondaryDwellingUnit', () => {
  it('should return "Yes" if HasSecondaryDwellingUnitYN is 1', () => {
    const listing: ApiListing = {
      raw: { HasSecondaryDwellingUnitYN: '1' }
    } as unknown as ApiListing

    const result = mapperSecondaryDwellingUnit(listing)
    expect(result).toBe('Yes')
  })

  it('should return "No" if HasSecondaryDwellingUnitYN is 0', () => {
    const listing: ApiListing = {
      raw: { HasSecondaryDwellingUnitYN: '0' }
    } as unknown as ApiListing

    const result = mapperSecondaryDwellingUnit(listing)
    expect(result).toBe('No')
  })

  it('should return null if HasSecondaryDwellingUnitYN is not present', () => {
    const listing: ApiListing = {
      raw: {}
    } as unknown as ApiListing

    const result = mapperSecondaryDwellingUnit(listing)
    expect(result).toBeNull()
  })
})

describe('mapperBuilderModel', () => {
  it('should return concatenated BuilderName and ModelName', () => {
    const listing: ApiListing = {
      raw: { BuilderName: 'Builder', ModelName: 'Model' }
    } as unknown as ApiListing

    const result = mapperBuilderModel(listing)
    expect(result).toBe('Builder / Model')
  })

  it('should return null if neither BuilderName nor ModelName is present', () => {
    const listing: ApiListing = {
      raw: {}
    } as unknown as ApiListing

    const result = mapperBuilderModel(listing)
    expect(result).toBeNull()
  })
})

describe('mapperLotSize', () => {
  it('should return formatted lot size in acres', () => {
    const listing: ApiListing = {
      raw: { LotSizeImpFrontage: '100', LotSizeImpDepth: '200' }
    } as unknown as ApiListing

    const result = mapperLotSize(listing)
    expect(result).toBe('0.46 acres')
  })

  it('should return null if LotSizeImpFrontage or LotSizeImpDepth is not present', () => {
    const listing: ApiListing = {
      raw: {}
    } as unknown as ApiListing

    const result = mapperLotSize(listing)
    expect(result).toBeNull()
  })
})

describe('mapperLotDimensions', () => {
  it('should keep decimals by default', () => {
    const listing = {
      lot: { width: 50.4, depth: 100.6 }
    } as unknown as ApiListing

    expect(mapperLotDimensions(listing)).toBe('50.4x100.6')
  })

  it('should round when fractionDigits is 0', () => {
    const listing = {
      lot: { width: 50.4, depth: 100.6 }
    } as unknown as ApiListing

    expect(mapperLotDimensions(listing, 0)).toBe('50x101')
  })

  it('should return null when width or depth is missing', () => {
    const listing = { lot: { width: 50 } } as unknown as ApiListing
    expect(mapperLotDimensions(listing, 0)).toBeNull()
  })
})

describe('mapperLotArea', () => {
  it('should derive sqft from width * depth and round when fractionDigits is 0', () => {
    const listing = {
      lot: { width: 50, depth: 100.6 }
    } as unknown as ApiListing

    expect(mapperLotArea(listing, 0)).toBe('5,030 sqft')
  })

  it('should derive sqft from acres when width/depth are missing', () => {
    const listing = { lot: { acres: '0.5' } } as unknown as ApiListing
    expect(mapperLotArea(listing, 0)).toBe('21,780 sqft')
  })

  it('should return null when no lot dimensions are present', () => {
    const listing = { lot: {} } as unknown as ApiListing
    expect(mapperLotArea(listing, 0)).toBeNull()
  })
})

describe('mapperSquareFeet', () => {
  it('should round when fractionDigits is 0', () => {
    const listing = {
      details: { sqft: 1234.56 }
    } as unknown as ApiListing

    expect(mapperSquareFeet(listing, 0)).toBe('1,235 sqft')
  })

  it('should return null when sqft is missing', () => {
    const listing = { details: {} } as unknown as ApiListing
    expect(mapperSquareFeet(listing, 0)).toBeNull()
  })
})

describe('mapperTaxesYear', () => {
  it('should return formatted annualAmount and assessmentYear', () => {
    const listing: ApiListing = {
      taxes: { annualAmount: '1000', assessmentYear: '2023' }
    } as unknown as ApiListing

    const result = mapperTaxesYear(listing)
    expect(result).toBe('$1,000 / 2023')
  })

  it('should drop decimals when fractionDigits is 0', () => {
    const listing = {
      taxes: { annualAmount: '1000.75', assessmentYear: '2023' }
    } as unknown as ApiListing

    expect(mapperTaxesYear(listing, 0)).toBe('$1,001 / 2023')
  })

  it('should return null if neither annualAmount nor assessmentYear is present', () => {
    const listing: ApiListing = {
      taxes: {}
    } as ApiListing

    const result = mapperTaxesYear(listing)
    expect(result).toEqual('')
  })
})

describe('mapperAssociationFeePOTL', () => {
  it('should return formatted association fee', () => {
    const listing = {
      raw: { AssocCommonAreaFeeAmt: '200', AssocFeeFrequency: 'Monthly' }
    } as unknown as ApiListing

    const result = mapperAssociationFeePOTL(listing)
    expect(result).toBe('$200 / Monthly')
  })

  it('should return null if AssociationFeePOTL is not present', () => {
    const listing = {
      raw: {}
    } as unknown as ApiListing

    const result = mapperAssociationFeePOTL(listing)
    expect(result).toBeNull()
  })
})

describe('mapperTotalBeds', () => {
  it('should return total number of beds', () => {
    const listing = {
      details: { numBedrooms: 3, numBedroomsPlus: 2 }
    } as unknown as ApiListing

    const result = mapperTotalBeds(listing)
    expect(result).toBe('3 + 2')
  })

  it('should return "", if bedroomsTotal is not present', () => {
    const listing = {
      details: {}
    } as unknown as ApiListing

    const result = mapperTotalBeds(listing)
    expect(result).toEqual('')
  })
})

describe('mapperBaths', () => {
  it('should return total number of baths', () => {
    const listing = {
      details: { numBathrooms: '2', numBathroomsPlus: '2' }
    } as unknown as ApiListing

    const result = mapperBaths(listing)
    expect(result).toBe('2 + 2')
  })

  it('should return "", if bathroomsTotal is not present', () => {
    const listing = {
      details: {}
    } as unknown as ApiListing

    const result = mapperBaths(listing)
    expect(result).toEqual('')
  })
})

describe('mapperTotalParking', () => {
  it('sums garage and driveway spaces', () => {
    const listing = {
      details: { numGarageSpaces: '3', numDrivewaySpaces: '7' }
    } as unknown as ApiListing

    const result = mapperTotalParking(listing)
    expect(result).toBe(10)
  })

  it('counts only the present side (condo: garage only)', () => {
    // numParkingSpaces is ignored — the total is derived from the garage and
    // driveway spaces shown beside it, so a 1-garage/0-driveway condo is "1".
    const listing = {
      details: {
        numGarageSpaces: '1',
        numDrivewaySpaces: null,
        numParkingSpaces: '1'
      }
    } as unknown as ApiListing

    const result = mapperTotalParking(listing)
    expect(result).toBe(1)
  })

  it('counts driveway spaces when there is no garage', () => {
    const listing = {
      details: { numDrivewaySpaces: '2' }
    } as unknown as ApiListing

    const result = mapperTotalParking(listing)
    expect(result).toBe(2)
  })

  it('is falsy when neither garage nor driveway is present', () => {
    const listing = {
      details: {}
    } as unknown as ApiListing

    const result = mapperTotalParking(listing)
    expect(result).toBeFalsy()
  })
})

describe('mapperAppliancesIncluded', () => {
  it('should return list of appliances included', () => {
    const listing = {
      raw: { AppliancesIncluded: 'Fridge,Stove' }
    } as unknown as ApiListing

    const result = mapperAppliancesIncluded(listing)
    expect(result).toEqual(['Fridge', 'Stove'])
  })

  it('should return null if AppliancesIncluded is not present', () => {
    const listing = {
      raw: {}
    } as unknown as ApiListing

    const result = mapperAppliancesIncluded(listing)
    expect(result).toBeNull()
  })
})

describe('mapperExclusions', () => {
  it('should return list of exclusions', () => {
    const listing = {
      raw: { Exclusions: 'Curtains & Round Mirror on 4th level foyer' }
    } as unknown as ApiListing

    const result = mapperExclusions(listing)
    expect(result).toEqual(['Curtains', 'Round Mirror on 4th level foyer'])
  })

  it('should return null if Exclusions is not present', () => {
    const listing = {
      raw: {}
    } as unknown as ApiListing

    const result = mapperExclusions(listing)
    expect(result).toBeNull()
  })
})

describe('mapperFeaturesEquipmentIncluded', () => {
  it('should return list of features and equipment included', () => {
    const listing = {
      raw: { FeaturesEquipmentIncluded: 'Washer,Dryer' }
    } as unknown as ApiListing

    const result = mapperFeaturesEquipmentIncluded(listing)
    expect(result).toEqual(['Washer', 'Dryer'])
  })

  it('should return null if FeaturesEquipmentIncluded is not present', () => {
    const listing = {
      raw: {}
    } as unknown as ApiListing

    const result = mapperFeaturesEquipmentIncluded(listing)
    expect(result).toBeNull()
  })
})

describe('mapperRentalEquipment', () => {
  it('should return correct list of rental equipment', () => {
    const listing = {
      raw: {
        RentalEquipment: 'Hot Water Tank $34.60 monthly + HST'
      }
    } as unknown as ApiListing

    const result = mapperRentalEquipment(listing)
    expect(result).toEqual(['HWT'])
  })

  it('should return null if RentalEquipment is not present', () => {
    const listing = {
      raw: {}
    } as unknown as ApiListing

    const result = mapperRentalEquipment(listing)
    expect(result).toBeNull()
  })
})

describe('mapperNeighbourhoodInfluences', () => {
  it('should return list of neighbourhood influences', () => {
    const listing = {
      nearby: { ammenities: ['Park', 'School'] }
    } as unknown as ApiListing

    const result = mapperNeighborhoodInfluences(listing)
    expect(result).toEqual(['Park', 'School'])
  })

  it('should return null if ammenities is not present', () => {
    const listing = {
      nearby: {}
    } as unknown as ApiListing

    const result = mapperNeighborhoodInfluences(listing)
    expect(result).toBeNull()
  })
})

describe('mapperConstructionYearBuilt', () => {
  it('should return concatenated yearBuilt and AgeDescription', () => {
    const listing = {
      details: { yearBuilt: '1956' },
      raw: { AgeDescription: 'Approx' }
    } as unknown as ApiListing

    const result = mapperConstructionYearBuilt(listing)
    expect(result).toBe('1956 Approx')
  })

  it('should return yearBuilt if AgeDescription is not present', () => {
    const listing = {
      details: { yearBuilt: '2000' },
      raw: {}
    } as unknown as ApiListing

    const result = mapperConstructionYearBuilt(listing)
    expect(result).toBe('2000')
  })

  it('should return null if yearBuilt is not present', () => {
    const listing = {
      details: {},
      raw: { AgeDescription: 'Approx' }
    } as unknown as ApiListing

    const result = mapperConstructionYearBuilt(listing)
    expect(result).toBeNull()
  })

  it('should return only yearBuilt, if AgeDescription is "Unknown"', () => {
    const listing = {
      details: { yearBuilt: '2000' },
      raw: { AgeDescription: 'Unknown' }
    } as unknown as ApiListing

    const result = mapperConstructionYearBuilt(listing)
    expect(result).toBe('2000')
  })
})

describe('mapperAcres', () => {
  it('should return formated lot size in acres', () => {
    const listing: ApiListing = {
      raw: { LotSizeImpFrontage: '100', LotSizeImpDepth: '200' }
    } as unknown as ApiListing

    const result = mapperAcres(listing)
    expect(result).toBe('0.46 acres')
  })

  it('should return null if LotSizeImpFrontage or LotSizeImpDepth is not present', () => {
    const listing: ApiListing = {
      raw: {}
    } as unknown as ApiListing

    const result = mapperAcres(listing)
    expect(result).toBeNull()
  })
})

describe('mapperFrontageFt', () => {
  it('should return formatted frontage in feet', () => {
    const listing: ApiListing = {
      raw: { LotSizeImpFrontage: '100.50' }
    } as unknown as ApiListing

    const result = mapperFrontageFt(listing)
    expect(result).toBe('100 ft')
  })

  it('should return null if LotSizeImpFrontage is not present', () => {
    const listing: ApiListing = {
      raw: {}
    } as unknown as ApiListing

    const result = mapperFrontageFt(listing)
    expect(result).toBeNull()
  })

  it('should return null if LotSizeImpFrontage is empty or zero', () => {
    const listing: ApiListing = {
      raw: { LotSizeImpFrontage: '0.00' }
    } as unknown as ApiListing

    const result = mapperFrontageFt(listing)
    expect(result).toBeNull()
  })
})

describe('mapperDepthFt', () => {
  it('should return formatted depth in feet', () => {
    const listing: ApiListing = {
      raw: { LotSizeImpDepth: '150.75' }
    } as unknown as ApiListing

    const result = mapperDepthFt(listing)
    expect(result).toBe('150 ft')
  })

  it('should return null if LotSizeImpDepth is not present', () => {
    const listing: ApiListing = {
      raw: {}
    } as unknown as ApiListing

    const result = mapperDepthFt(listing)
    expect(result).toBeNull()
  })

  it('should return null if LotSizeImpDepth is empty or zero', () => {
    const listing: ApiListing = {
      raw: { LotSizeImpDepth: '0.00' }
    } as unknown as ApiListing

    const result = mapperDepthFt(listing)
    expect(result).toBeNull()
  })
})

describe('mapperSpecialAssessment', () => {
  it('should return concatenated AssessmentYear and AssessmentAmount', () => {
    const listing: ApiListing = {
      raw: { AssessmentYear: '2021', AssessmentAmount: '5000' }
    } as unknown as ApiListing

    const result = mapperSpecialAssessment(listing)
    expect(result).toBe('2021 / 5000')
  })

  it('should return null if neither AssessmentYear nor AssessmentAmount is present', () => {
    const listing: ApiListing = {
      raw: {}
    } as unknown as ApiListing

    const result = mapperSpecialAssessment(listing)
    expect(result).toBeNull()
  })

  it('should return only AssessmentYear if AssessmentAmount is not present', () => {
    const listing: ApiListing = {
      raw: { AssessmentYear: '2021' }
    } as unknown as ApiListing

    const result = mapperSpecialAssessment(listing)
    expect(result).toBe('2021')
  })

  it('should return only AssessmentAmount if AssessmentYear is not present', () => {
    const listing: ApiListing = {
      raw: { AssessmentAmount: '5000' }
    } as unknown as ApiListing

    const result = mapperSpecialAssessment(listing)
    expect(result).toBe('5000')
  })
})

describe('mapperLaundry', () => {
  it('should return concatenated ensuiteLaundry and LaundryFacilities', () => {
    const listing: ApiListing = {
      raw: { LaundryFacilities: 'Shared' },
      condominium: { ensuiteLaundry: 'Yes' }
    } as unknown as ApiListing

    const result = mapperLaundry(listing)
    expect(result).toBe('Yes | Shared')
  })

  it('should return null if neither ensuiteLaundry nor LaundryFacilities is present', () => {
    const listing: ApiListing = {
      raw: {},
      condominium: {}
    } as unknown as ApiListing

    const result = mapperLaundry(listing)
    expect(result).toBeNull()
  })

  it('should return only ensuiteLaundry if LaundryFacilities is not present', () => {
    const listing: ApiListing = {
      raw: {},
      condominium: { ensuiteLaundry: 'Yes' }
    } as unknown as ApiListing

    const result = mapperLaundry(listing)
    expect(result).toBe('Yes')
  })

  it('should return only LaundryFacilities if ensuiteLaundry is not present', () => {
    const listing: ApiListing = {
      raw: { LaundryFacilities: 'Shared' },
      condominium: {}
    } as unknown as ApiListing

    const result = mapperLaundry(listing)
    expect(result).toBe('Shared')
  })
})

describe('mapperCCPName', () => {
  it('should return concatenated condoCorpNum and condoCorp', () => {
    const listing: ApiListing = {
      condominium: { condoCorpNum: '123', condoCorp: 'ABC Corp' }
    } as unknown as ApiListing

    const result = mapperCCPName(listing)
    expect(result).toBe('123 / ABC Corp')
  })

  it('should return null if neither condoCorpNum nor condoCorp is present', () => {
    const listing: ApiListing = {
      condominium: {}
    } as unknown as ApiListing

    const result = mapperCCPName(listing)
    expect(result).toBeNull()
  })

  it('should return only condoCorpNum if condoCorp is not present', () => {
    const listing: ApiListing = {
      condominium: { condoCorpNum: '123' }
    } as unknown as ApiListing

    const result = mapperCCPName(listing)
    expect(result).toBe('123')
  })

  it('should return only condoCorp if condoCorpNum is not present', () => {
    const listing: ApiListing = {
      condominium: { condoCorp: 'ABC Corp' }
    } as unknown as ApiListing

    const result = mapperCCPName(listing)
    expect(result).toBe('ABC Corp')
  })
})

describe('mapperLevelsUnit', () => {
  it('should return rounded down NumberofLevelsInUnit', () => {
    const listing: ApiListing = {
      raw: { NumberofLevelsInUnit: '3.75' }
    } as unknown as ApiListing

    const result = mapperLevelsUnit(listing)
    expect(result).toBe(3)
  })

  it('should return null if NumberofLevelsInUnit is not present', () => {
    const listing: ApiListing = {
      raw: {}
    } as unknown as ApiListing

    const result = mapperLevelsUnit(listing)
    expect(result).toBeNull()
  })

  it('should return null if NumberofLevelsInUnit is NaN', () => {
    const listing: ApiListing = {
      raw: { NumberofLevelsInUnit: 'invalid' }
    } as unknown as ApiListing

    const result = mapperLevelsUnit(listing)
    expect(result).toBeNull()
  })
})

describe('mapperSpaceAfterComma', () => {
  it('should add space after comma in the given key', () => {
    const listing: ApiListing = {
      raw: { TestKey: 'value1,value2' }
    } as unknown as ApiListing

    const result = mapperSpaceAfterComma(listing, 'TestKey')
    expect(result).toBe('value1, value2')
  })

  it('should return null if the key is not present', () => {
    const listing: ApiListing = {
      raw: {}
    } as unknown as ApiListing

    const result = mapperSpaceAfterComma(listing, 'TestKey')
    expect(result).toBeNull()
  })
})

describe('mapperFloorCovering', () => {
  it('should add space after comma in FloorCovering', () => {
    const listing: ApiListing = {
      raw: { FloorCovering: 'wood,carpet' }
    } as unknown as ApiListing

    const result = mapperFloorCovering(listing)
    expect(result).toBe('wood, carpet')
  })

  it('should return null if FloorCovering is not present', () => {
    const listing: ApiListing = {
      raw: {}
    } as unknown as ApiListing

    const result = mapperFloorCovering(listing)
    expect(result).toBeNull()
  })
})

describe('mapperParkingDescription', () => {
  it('should add space after comma in ParkingDesc', () => {
    const listing: ApiListing = {
      raw: { ParkingDesc: 'garage,driveway' }
    } as unknown as ApiListing

    const result = mapperParkingDescription(listing)
    expect(result).toBe('garage, driveway')
  })

  it('should return null if ParkingDesc is not present', () => {
    const listing: ApiListing = {
      raw: {}
    } as unknown as ApiListing

    const result = mapperParkingDescription(listing)
    expect(result).toBeNull()
  })
})

describe('mapperFeeIncludes', () => {
  it('should add space after comma in FeeIncludes', () => {
    const listing: ApiListing = {
      raw: { FeeIncludes: 'water,heat' }
    } as unknown as ApiListing

    const result = mapperFeeIncludes(listing)
    expect(result).toBe('water, heat')
  })

  it('should return null if FeeIncludes is not present', () => {
    const listing: ApiListing = {
      raw: {}
    } as unknown as ApiListing

    const result = mapperFeeIncludes(listing)
    expect(result).toBeNull()
  })
})

describe('mapperAssociationFeeIncludes', () => {
  it('should drop the " Included" suffix and join the picklist', () => {
    const listing = {
      raw: {
        AssociationFeeIncludes: [
          'Heat Included',
          'Common Elements Included',
          'CAC Included'
        ]
      }
    } as unknown as ApiListing

    expect(mapperAssociationFeeIncludes(listing)).toBe(
      'Heat, Common Elements, CAC'
    )
  })

  it('should drop the "None" entry', () => {
    const listing = {
      raw: { AssociationFeeIncludes: ['None', 'Water Included'] }
    } as unknown as ApiListing

    expect(mapperAssociationFeeIncludes(listing)).toBe('Water')
  })

  it('should return null when "None" is the only entry', () => {
    const listing = {
      raw: { AssociationFeeIncludes: ['None'] }
    } as unknown as ApiListing

    expect(mapperAssociationFeeIncludes(listing)).toBeNull()
  })

  it('should return null when the field is absent', () => {
    const listing = { raw: {} } as unknown as ApiListing

    expect(mapperAssociationFeeIncludes(listing)).toBeNull()
  })
})

describe('mapperRentIncludes', () => {
  it('should join the lease picklist, which carries no suffix', () => {
    const listing = {
      raw: { RentIncludes: ['Common Elements', 'Parking', 'Water'] }
    } as unknown as ApiListing

    expect(mapperRentIncludes(listing)).toBe('Common Elements, Parking, Water')
  })

  it('should return null on a sale listing, where the field is empty', () => {
    const listing = { raw: { RentIncludes: [] } } as unknown as ApiListing

    expect(mapperRentIncludes(listing)).toBeNull()
  })
})

describe('mapperExterior', () => {
  it('should add space after comma in exteriorConstruction1', () => {
    const listing: ApiListing = {
      details: { exteriorConstruction1: 'brick,wood' }
    } as unknown as ApiListing

    const result = mapperExterior(listing)
    expect(result).toBe('brick, wood')
  })

  it('should return null if exteriorConstruction1 is not present', () => {
    const listing: ApiListing = {
      details: {}
    } as unknown as ApiListing

    const result = mapperExterior(listing)
    expect(result).toBeNull()
  })
})

describe('mapperParkingType', () => {
  it('should add space after comma in parkingType', () => {
    const listing: ApiListing = {
      condominium: { parkingType: 'underground,covered' }
    } as unknown as ApiListing

    const result = mapperParkingType(listing)
    expect(result).toBe('underground, covered')
  })

  it('should return null if parkingType is not present', () => {
    const listing: ApiListing = {
      condominium: {}
    } as unknown as ApiListing

    const result = mapperParkingType(listing)
    expect(result).toBeNull()
  })
})

describe('mapperCondoFees', () => {
  it('should return formatted maintenance fee and CondoFeeFrequency', () => {
    const listing: ApiListing = {
      raw: { CondoFeeFrequency: 'Monthly' },
      condominium: { fees: { maintenance: '250.00' } }
    } as unknown as ApiListing

    const result = mapperCondoFees(listing)
    expect(result).toBe('$250 / Monthly')
  })

  it('should drop decimals when fractionDigits is 0', () => {
    const listing: ApiListing = {
      raw: { CondoFeeFrequency: 'Monthly' },
      condominium: { fees: { maintenance: '250.75' } }
    } as unknown as ApiListing

    const result = mapperCondoFees(listing, 0)
    expect(result).toBe('$251 / Monthly')
  })

  it('should return null if maintenance fee is not present', () => {
    const listing: ApiListing = {
      raw: { CondoFeeFrequency: 'Monthly' },
      condominium: { fees: {} }
    } as unknown as ApiListing

    const result = mapperCondoFees(listing)
    expect(result).toBeNull()
  })

  it('should return null if maintenance fee is empty', () => {
    const listing: ApiListing = {
      raw: { CondoFeeFrequency: 'Monthly' },
      condominium: { fees: { maintenance: '' } }
    } as unknown as ApiListing

    const result = mapperCondoFees(listing)
    expect(result).toBeNull()
  })

  it('should return null if maintenance fee is NaN', () => {
    const listing: ApiListing = {
      raw: { CondoFeeFrequency: 'Monthly' },
      condominium: { fees: { maintenance: 'invalid' } }
    } as unknown as ApiListing

    const result = mapperCondoFees(listing)
    expect(result).toBeNull()
  })
})
