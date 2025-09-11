import { type Property } from 'services/API'

import {
  mapperAcres,
  mapperAppliancesIncluded,
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
  mapperLotSize,
  mapperNeighborhoodInfluences,
  mapperParkingDescription,
  mapperParkingType,
  mapperRentalEquipment,
  mapperSecondaryDwellingUnit,
  mapperSoldDate,
  mapperSpaceAfterComma,
  mapperSpecialAssessment,
  mapperTaxesYear,
  mapperTotalBeds,
  mapperTotalParking
} from './mappers'

describe('mapperCategory', () => {
  it('should return the class without "Property" if class is defined', () => {
    const property: Property = {
      class: 'ResidentialProperty'
    } as Property

    const result = mapperCategory(property)
    expect(result).toBe('Residential')
  })

  it('should return null if class is not defined', () => {
    const property: Property = {} as Property

    const result = mapperCategory(property)
    expect(result).toBeNull()
  })
})

describe('mapperDaysOnMarket', () => {
  it('should contains number of days ago for unsold property', () => {
    const property: Property = {
      lastStatus: 'New',
      listDate: '2024-09-30T00:00:00.000Z',
      soldDate: null
    } as unknown as Property

    const result = mapperDaysOnMarket(property)
    expect(result).toContain('days ago')
  })

  it('should return null if the property is sold', () => {
    const property: Property = {
      lastStatus: 'Sld',
      listDate: '2023-06-09T00:00:00.000Z',
      soldDate: '2023-06-12T00:00:00.000Z'
    } as unknown as Property

    const result = mapperDaysOnMarket(property)
    expect(result).toBeNull()
  })
})

describe('mapperListDate', () => {
  it('should return formatted listDate if property is not sold', () => {
    const property: Property = {
      lastStatus: 'New',
      listDate: '2023-06-09T00:00:00.000Z',
      soldDate: null
    } as unknown as Property

    expect(mapperListDate(property)).toBe('Jun 9, 2023')
  })

  it('should return null if property is sold and type is not Lease', () => {
    const property: Property = {
      lastStatus: 'Sold',
      listDate: '2023-06-09T00:00:00.000Z',
      soldDate: '2023-06-12T00:00:00.000Z',
      type: 'Sale'
    } as unknown as Property

    expect(mapperListDate(property)).toBeNull()
  })

  it('should return formatted listDate if property is sold and type is Lease', () => {
    const property: Property = {
      lastStatus: 'Sold',
      listDate: '2023-06-09T00:00:00.000Z',
      soldDate: '2023-06-12T00:00:00.000Z',
      type: 'Lease'
    } as unknown as Property

    expect(mapperListDate(property)).toBe('Jun 9, 2023')
  })

  it('should return null if listDate is not provided', () => {
    const property: Property = {
      lastStatus: 'Active',
      listDate: null,
      soldDate: null
    } as unknown as Property

    const result = mapperListDate(property)
    expect(result).toBeNull()
  })
})

describe('mapperSoldDate', () => {
  it('should return formatted soldDate if soldDate is provided', () => {
    const property: Property = {
      soldDate: '2023-06-12T00:00:00.000Z'
    } as unknown as Property

    const result = mapperSoldDate(property)
    expect(result).toBe('Jun 12, 2023')
  })

  it('should return null if soldDate is not provided', () => {
    const property: Property = {
      soldDate: null
    } as unknown as Property

    const result = mapperSoldDate(property)
    expect(result).toBeNull()
  })
})

describe('mapperListingUpdatedOn', () => {
  it('should return formatted updatedOn date', () => {
    const property: Property = {
      updatedOn: '2023-06-14T00:00:00.000Z'
    } as unknown as Property

    const result = mapperListingUpdatedOn(property)
    expect(result).toBe('Jun 14, 2023')
  })
})

describe('mapperSecondaryDwellingUnit', () => {
  it('should return "Yes" if HasSecondaryDwellingUnitYN is 1', () => {
    const property: Property = {
      raw: { HasSecondaryDwellingUnitYN: '1' }
    } as unknown as Property

    const result = mapperSecondaryDwellingUnit(property)
    expect(result).toBe('Yes')
  })

  it('should return "No" if HasSecondaryDwellingUnitYN is 0', () => {
    const property: Property = {
      raw: { HasSecondaryDwellingUnitYN: '0' }
    } as unknown as Property

    const result = mapperSecondaryDwellingUnit(property)
    expect(result).toBe('No')
  })

  it('should return null if HasSecondaryDwellingUnitYN is not present', () => {
    const property: Property = {
      raw: {}
    } as unknown as Property

    const result = mapperSecondaryDwellingUnit(property)
    expect(result).toBeNull()
  })
})

describe('mapperBuilderModel', () => {
  it('should return concatenated BuilderName and ModelName', () => {
    const property: Property = {
      raw: { BuilderName: 'Builder', ModelName: 'Model' }
    } as unknown as Property

    const result = mapperBuilderModel(property)
    expect(result).toBe('Builder / Model')
  })

  it('should return null if neither BuilderName nor ModelName is present', () => {
    const property: Property = {
      raw: {}
    } as unknown as Property

    const result = mapperBuilderModel(property)
    expect(result).toBeNull()
  })
})

describe('mapperLotSize', () => {
  it('should return formatted lot size in acres', () => {
    const property: Property = {
      raw: { LotSizeImpFrontage: '100', LotSizeImpDepth: '200' }
    } as unknown as Property

    const result = mapperLotSize(property)
    expect(result).toBe('0.46 acres')
  })

  it('should return null if LotSizeImpFrontage or LotSizeImpDepth is not present', () => {
    const property: Property = {
      raw: {}
    } as unknown as Property

    const result = mapperLotSize(property)
    expect(result).toBeNull()
  })
})

describe('mapperTaxesYear', () => {
  it('should return formatted annualAmount and assessmentYear', () => {
    const property: Property = {
      taxes: { annualAmount: '1000', assessmentYear: '2023' }
    } as unknown as Property

    const result = mapperTaxesYear(property)
    expect(result).toBe('$1,000 / 2023')
  })

  it('should return null if neither annualAmount nor assessmentYear is present', () => {
    const property: Property = {
      taxes: {}
    } as Property

    const result = mapperTaxesYear(property)
    expect(result).toEqual('')
  })
})

describe('mapperAssociationFeePOTL', () => {
  it('should return formatted association fee', () => {
    const property = {
      raw: { AssocCommonAreaFeeAmt: '200', AssocFeeFrequency: 'Monthly' }
    } as unknown as Property

    const result = mapperAssociationFeePOTL(property)
    expect(result).toBe('$200 / Monthly')
  })

  it('should return null if AssociationFeePOTL is not present', () => {
    const property = {
      raw: {}
    } as unknown as Property

    const result = mapperAssociationFeePOTL(property)
    expect(result).toBeNull()
  })
})

describe('mapperTotalBeds', () => {
  it('should return total number of beds', () => {
    const property = {
      details: { numBedrooms: 3, numBedroomsPlus: 2 }
    } as unknown as Property

    const result = mapperTotalBeds(property)
    expect(result).toBe('3 + 2')
  })

  it('should return "", if bedroomsTotal is not present', () => {
    const property = {
      details: {}
    } as unknown as Property

    const result = mapperTotalBeds(property)
    expect(result).toEqual('')
  })
})

describe('mapperBaths', () => {
  it('should return total number of baths', () => {
    const property = {
      details: { numBathrooms: '2', numBathroomsPlus: '2' }
    } as unknown as Property

    const result = mapperBaths(property)
    expect(result).toBe('2 + 2')
  })

  it('should return "", if bathroomsTotal is not present', () => {
    const property = {
      details: {}
    } as unknown as Property

    const result = mapperBaths(property)
    expect(result).toEqual('')
  })
})

describe('mapperTotalParking', () => {
  it('should return total number of parking spaces', () => {
    const property = {
      details: { numParkingSpaces: '2', numGarageSpaces: '2' }
    } as unknown as Property

    const result = mapperTotalParking(property)
    expect(result).toBe('2 + 2')
  })

  it('should return numParkingSpaces, if numGarageSpaces is not present', () => {
    const property = {
      details: { numParkingSpaces: '2' }
    } as unknown as Property

    const result = mapperTotalParking(property)
    expect(result).toBe('2')
  })

  it('should return numGarageSpaces, if numParkingSpaces is not present', () => {
    const property = {
      details: { numGarageSpaces: '2' }
    } as unknown as Property

    const result = mapperTotalParking(property)
    expect(result).toBe('2')
  })

  it('should return null if parkingTotal is not present', () => {
    const property = {
      details: {}
    } as unknown as Property

    const result = mapperTotalParking(property)
    expect(result).toBeFalsy()
  })
})

describe('mapperAppliancesIncluded', () => {
  it('should return list of appliances included', () => {
    const property = {
      raw: { AppliancesIncluded: 'Fridge,Stove' }
    } as unknown as Property

    const result = mapperAppliancesIncluded(property)
    expect(result).toEqual(['Fridge', 'Stove'])
  })

  it('should return null if AppliancesIncluded is not present', () => {
    const property = {
      raw: {}
    } as unknown as Property

    const result = mapperAppliancesIncluded(property)
    expect(result).toBeNull()
  })
})

describe('mapperExclusions', () => {
  it('should return list of exclusions', () => {
    const property = {
      raw: { Exclusions: 'Curtains & Round Mirror on 4th level foyer' }
    } as unknown as Property

    const result = mapperExclusions(property)
    expect(result).toEqual(['Curtains', 'Round Mirror on 4th level foyer'])
  })

  it('should return null if Exclusions is not present', () => {
    const property = {
      raw: {}
    } as unknown as Property

    const result = mapperExclusions(property)
    expect(result).toBeNull()
  })
})

describe('mapperFeaturesEquipmentIncluded', () => {
  it('should return list of features and equipment included', () => {
    const property = {
      raw: { FeaturesEquipmentIncluded: 'Washer,Dryer' }
    } as unknown as Property

    const result = mapperFeaturesEquipmentIncluded(property)
    expect(result).toEqual(['Washer', 'Dryer'])
  })

  it('should return null if FeaturesEquipmentIncluded is not present', () => {
    const property = {
      raw: {}
    } as unknown as Property

    const result = mapperFeaturesEquipmentIncluded(property)
    expect(result).toBeNull()
  })
})

describe('mapperRentalEquipment', () => {
  it('should return correct list of rental equipment', () => {
    const property = {
      raw: {
        RentalEquipment: 'Hot Water Tank $34.60 monthly + HST'
      }
    } as unknown as Property

    const result = mapperRentalEquipment(property)
    expect(result).toEqual(['HWT'])
  })

  it('should return null if RentalEquipment is not present', () => {
    const property = {
      raw: {}
    } as unknown as Property

    const result = mapperRentalEquipment(property)
    expect(result).toBeNull()
  })
})

describe('mapperNeighbourhoodInfluences', () => {
  it('should return list of neighbourhood influences', () => {
    const property = {
      nearby: { ammenities: ['Park', 'School'] }
    } as unknown as Property

    const result = mapperNeighborhoodInfluences(property)
    expect(result).toEqual(['Park', 'School'])
  })

  it('should return null if ammenities is not present', () => {
    const property = {
      nearby: {}
    } as unknown as Property

    const result = mapperNeighborhoodInfluences(property)
    expect(result).toBeNull()
  })
})

describe('mapperConstructionYearBuilt', () => {
  it('should return concatenated yearBuilt and AgeDescription', () => {
    const property = {
      details: { yearBuilt: '1956' },
      raw: { AgeDescription: 'Approx' }
    } as unknown as Property

    const result = mapperConstructionYearBuilt(property)
    expect(result).toBe('1956 Approx')
  })

  it('should return yearBuilt if AgeDescription is not present', () => {
    const property = {
      details: { yearBuilt: '2000' },
      raw: {}
    } as unknown as Property

    const result = mapperConstructionYearBuilt(property)
    expect(result).toBe('2000')
  })

  it('should return null if yearBuilt is not present', () => {
    const property = {
      details: {},
      raw: { AgeDescription: 'Approx' }
    } as unknown as Property

    const result = mapperConstructionYearBuilt(property)
    expect(result).toBeNull()
  })

  it('should return only yearBuilt, if AgeDescription is "Unknown"', () => {
    const property = {
      details: { yearBuilt: '2000' },
      raw: { AgeDescription: 'Unknown' }
    } as unknown as Property

    const result = mapperConstructionYearBuilt(property)
    expect(result).toBe('2000')
  })
})

describe('mapperAcres', () => {
  it('should return formated lot size in acres', () => {
    const property: Property = {
      raw: { LotSizeImpFrontage: '100', LotSizeImpDepth: '200' }
    } as unknown as Property

    const result = mapperAcres(property)
    expect(result).toBe('0.46 acres')
  })

  it('should return null if LotSizeImpFrontage or LotSizeImpDepth is not present', () => {
    const property: Property = {
      raw: {}
    } as unknown as Property

    const result = mapperAcres(property)
    expect(result).toBeNull()
  })
})

describe('mapperFrontageFt', () => {
  it('should return formatted frontage in feet', () => {
    const property: Property = {
      raw: { LotSizeImpFrontage: '100.50' }
    } as unknown as Property

    const result = mapperFrontageFt(property)
    expect(result).toBe('100 ft')
  })

  it('should return null if LotSizeImpFrontage is not present', () => {
    const property: Property = {
      raw: {}
    } as unknown as Property

    const result = mapperFrontageFt(property)
    expect(result).toBeNull()
  })

  it('should return null if LotSizeImpFrontage is empty or zero', () => {
    const property: Property = {
      raw: { LotSizeImpFrontage: '0.00' }
    } as unknown as Property

    const result = mapperFrontageFt(property)
    expect(result).toBeNull()
  })
})

describe('mapperDepthFt', () => {
  it('should return formatted depth in feet', () => {
    const property: Property = {
      raw: { LotSizeImpDepth: '150.75' }
    } as unknown as Property

    const result = mapperDepthFt(property)
    expect(result).toBe('150 ft')
  })

  it('should return null if LotSizeImpDepth is not present', () => {
    const property: Property = {
      raw: {}
    } as unknown as Property

    const result = mapperDepthFt(property)
    expect(result).toBeNull()
  })

  it('should return null if LotSizeImpDepth is empty or zero', () => {
    const property: Property = {
      raw: { LotSizeImpDepth: '0.00' }
    } as unknown as Property

    const result = mapperDepthFt(property)
    expect(result).toBeNull()
  })
})

describe('mapperSpecialAssessment', () => {
  it('should return concatenated AssessmentYear and AssessmentAmount', () => {
    const property: Property = {
      raw: { AssessmentYear: '2021', AssessmentAmount: '5000' }
    } as unknown as Property

    const result = mapperSpecialAssessment(property)
    expect(result).toBe('2021 / 5000')
  })

  it('should return null if neither AssessmentYear nor AssessmentAmount is present', () => {
    const property: Property = {
      raw: {}
    } as unknown as Property

    const result = mapperSpecialAssessment(property)
    expect(result).toBeNull()
  })

  it('should return only AssessmentYear if AssessmentAmount is not present', () => {
    const property: Property = {
      raw: { AssessmentYear: '2021' }
    } as unknown as Property

    const result = mapperSpecialAssessment(property)
    expect(result).toBe('2021')
  })

  it('should return only AssessmentAmount if AssessmentYear is not present', () => {
    const property: Property = {
      raw: { AssessmentAmount: '5000' }
    } as unknown as Property

    const result = mapperSpecialAssessment(property)
    expect(result).toBe('5000')
  })
})

describe('mapperLaundry', () => {
  it('should return concatenated ensuiteLaundry and LaundryFacilities', () => {
    const property: Property = {
      raw: { LaundryFacilities: 'Shared' },
      condominium: { ensuiteLaundry: 'Yes' }
    } as unknown as Property

    const result = mapperLaundry(property)
    expect(result).toBe('Yes | Shared')
  })

  it('should return null if neither ensuiteLaundry nor LaundryFacilities is present', () => {
    const property: Property = {
      raw: {},
      condominium: {}
    } as unknown as Property

    const result = mapperLaundry(property)
    expect(result).toBeNull()
  })

  it('should return only ensuiteLaundry if LaundryFacilities is not present', () => {
    const property: Property = {
      raw: {},
      condominium: { ensuiteLaundry: 'Yes' }
    } as unknown as Property

    const result = mapperLaundry(property)
    expect(result).toBe('Yes')
  })

  it('should return only LaundryFacilities if ensuiteLaundry is not present', () => {
    const property: Property = {
      raw: { LaundryFacilities: 'Shared' },
      condominium: {}
    } as unknown as Property

    const result = mapperLaundry(property)
    expect(result).toBe('Shared')
  })
})

describe('mapperCCPName', () => {
  it('should return concatenated condoCorpNum and condoCorp', () => {
    const property: Property = {
      condominium: { condoCorpNum: '123', condoCorp: 'ABC Corp' }
    } as unknown as Property

    const result = mapperCCPName(property)
    expect(result).toBe('123 / ABC Corp')
  })

  it('should return null if neither condoCorpNum nor condoCorp is present', () => {
    const property: Property = {
      condominium: {}
    } as unknown as Property

    const result = mapperCCPName(property)
    expect(result).toBeNull()
  })

  it('should return only condoCorpNum if condoCorp is not present', () => {
    const property: Property = {
      condominium: { condoCorpNum: '123' }
    } as unknown as Property

    const result = mapperCCPName(property)
    expect(result).toBe('123')
  })

  it('should return only condoCorp if condoCorpNum is not present', () => {
    const property: Property = {
      condominium: { condoCorp: 'ABC Corp' }
    } as unknown as Property

    const result = mapperCCPName(property)
    expect(result).toBe('ABC Corp')
  })
})

describe('mapperLevelsUnit', () => {
  it('should return rounded down NumberofLevelsInUnit', () => {
    const property: Property = {
      raw: { NumberofLevelsInUnit: '3.75' }
    } as unknown as Property

    const result = mapperLevelsUnit(property)
    expect(result).toBe(3)
  })

  it('should return null if NumberofLevelsInUnit is not present', () => {
    const property: Property = {
      raw: {}
    } as unknown as Property

    const result = mapperLevelsUnit(property)
    expect(result).toBeNull()
  })

  it('should return null if NumberofLevelsInUnit is NaN', () => {
    const property: Property = {
      raw: { NumberofLevelsInUnit: 'invalid' }
    } as unknown as Property

    const result = mapperLevelsUnit(property)
    expect(result).toBeNull()
  })
})

describe('mapperSpaceAfterComma', () => {
  it('should add space after comma in the given key', () => {
    const property: Property = {
      raw: { TestKey: 'value1,value2' }
    } as unknown as Property

    const result = mapperSpaceAfterComma(property, 'TestKey')
    expect(result).toBe('value1, value2')
  })

  it('should return null if the key is not present', () => {
    const property: Property = {
      raw: {}
    } as unknown as Property

    const result = mapperSpaceAfterComma(property, 'TestKey')
    expect(result).toBeNull()
  })
})

describe('mapperFloorCovering', () => {
  it('should add space after comma in FloorCovering', () => {
    const property: Property = {
      raw: { FloorCovering: 'wood,carpet' }
    } as unknown as Property

    const result = mapperFloorCovering(property)
    expect(result).toBe('wood, carpet')
  })

  it('should return null if FloorCovering is not present', () => {
    const property: Property = {
      raw: {}
    } as unknown as Property

    const result = mapperFloorCovering(property)
    expect(result).toBeNull()
  })
})

describe('mapperParkingDescription', () => {
  it('should add space after comma in ParkingDesc', () => {
    const property: Property = {
      raw: { ParkingDesc: 'garage,driveway' }
    } as unknown as Property

    const result = mapperParkingDescription(property)
    expect(result).toBe('garage, driveway')
  })

  it('should return null if ParkingDesc is not present', () => {
    const property: Property = {
      raw: {}
    } as unknown as Property

    const result = mapperParkingDescription(property)
    expect(result).toBeNull()
  })
})

describe('mapperFeeIncludes', () => {
  it('should add space after comma in FeeIncludes', () => {
    const property: Property = {
      raw: { FeeIncludes: 'water,heat' }
    } as unknown as Property

    const result = mapperFeeIncludes(property)
    expect(result).toBe('water, heat')
  })

  it('should return null if FeeIncludes is not present', () => {
    const property: Property = {
      raw: {}
    } as unknown as Property

    const result = mapperFeeIncludes(property)
    expect(result).toBeNull()
  })
})

describe('mapperExterior', () => {
  it('should add space after comma in exteriorConstruction1', () => {
    const property: Property = {
      details: { exteriorConstruction1: 'brick,wood' }
    } as unknown as Property

    const result = mapperExterior(property)
    expect(result).toBe('brick, wood')
  })

  it('should return null if exteriorConstruction1 is not present', () => {
    const property: Property = {
      details: {}
    } as unknown as Property

    const result = mapperExterior(property)
    expect(result).toBeNull()
  })
})

describe('mapperParkingType', () => {
  it('should add space after comma in parkingType', () => {
    const property: Property = {
      condominium: { parkingType: 'underground,covered' }
    } as unknown as Property

    const result = mapperParkingType(property)
    expect(result).toBe('underground, covered')
  })

  it('should return null if parkingType is not present', () => {
    const property: Property = {
      condominium: {}
    } as unknown as Property

    const result = mapperParkingType(property)
    expect(result).toBeNull()
  })
})

describe('mapperCondoFees', () => {
  it('should return formatted maintenance fee and CondoFeeFrequency', () => {
    const property: Property = {
      raw: { CondoFeeFrequency: 'Monthly' },
      condominium: { fees: { maintenance: '250.00' } }
    } as unknown as Property

    const result = mapperCondoFees(property)
    expect(result).toBe('$250 / Monthly')
  })

  it('should return null if maintenance fee is not present', () => {
    const property: Property = {
      raw: { CondoFeeFrequency: 'Monthly' },
      condominium: { fees: {} }
    } as unknown as Property

    const result = mapperCondoFees(property)
    expect(result).toBeNull()
  })

  it('should return null if maintenance fee is empty', () => {
    const property: Property = {
      raw: { CondoFeeFrequency: 'Monthly' },
      condominium: { fees: { maintenance: '' } }
    } as unknown as Property

    const result = mapperCondoFees(property)
    expect(result).toBeNull()
  })

  it('should return null if maintenance fee is NaN', () => {
    const property: Property = {
      raw: { CondoFeeFrequency: 'Monthly' },
      condominium: { fees: { maintenance: 'invalid' } }
    } as unknown as Property

    const result = mapperCondoFees(property)
    expect(result).toBeNull()
  })
})
