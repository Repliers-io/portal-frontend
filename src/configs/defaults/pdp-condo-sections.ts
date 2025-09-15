import sections from '@configs/pdp-sections'

import { type Property } from 'services/API'
import {
  mapperAssociationFeePOTL,
  mapperBaths,
  mapperBuilderModel,
  mapperCategory,
  mapperCCPName,
  mapperCondoFees,
  mapperConstructionYearBuilt,
  mapperDaysOnMarket,
  mapperExterior,
  mapperFeeIncludes,
  mapperFloorCovering,
  mapperLaundry,
  mapperLevelsUnit,
  mapperListDate,
  mapperListingUpdatedOn,
  mapperParkingDescription,
  mapperParkingType,
  mapperSecondaryDwellingUnit,
  mapperSoldDate,
  mapperSpecialAssessment,
  mapperTaxesYear,
  mapperTotalBeds,
  mapperTotalParking
} from 'utils/dataMapper/mappers'
import { toAffirmative, toSafeNumber } from 'utils/formatters'
import { scrubbed } from 'utils/properties'

const condoSections = {
  ...sections,
  home: {
    name: 'pdp.sections.home.name',
    groups: [
      {
        items: [
          {
            label: 'pdp.fields.category',
            fn: mapperCategory
            // path: 'class'
          },
          { label: 'pdp.fields.style', path: 'details.propertyType' },
          { label: 'pdp.fields.type', path: 'details.style' },
          { label: 'pdp.fields.fronting', path: 'raw.FrontingOn' }
        ]
      },
      {
        items: [
          { label: 'pdp.fields.titleForm', path: 'raw.TitleForm' },
          {
            label: 'pdp.fields.taxesYear',
            fn: mapperTaxesYear
            // path: 'taxes.annualAmount, taxes.assessmentYear'
          },
          {
            label: 'pdp.fields.associationFeePOTL',
            fn: mapperAssociationFeePOTL
            // path: 'raw.AssocCommonAreaFeeAmt, raw.AssocFeeFrequency'
          },
          {
            label: 'pdp.fields.condoFees',
            fn: mapperCondoFees
            // path: 'condominium.fees.maintenance'
          },
          {
            label: 'pdp.fields.feeIncludes',
            fn: mapperFeeIncludes
            //  path: 'raw.FeeIncludes'
          },
          {
            label: 'pdp.fields.specialAssessment',
            fn: mapperSpecialAssessment
            // path: 'raw.AssessmentYear, raw.AssessmentAmount'
          }
        ]
      },
      {
        items: [
          { label: 'pdp.fields.status', path: 'lastStatus' },
          {
            label: 'pdp.fields.daysOnMarket',
            fn: mapperDaysOnMarket
            // path: 'listDate, soldDate'
          },
          {
            label: 'pdp.fields.listDate',
            fn: mapperListDate
            // path: 'listDate'
          },
          {
            label: 'pdp.fields.soldDate',
            fn: mapperSoldDate
            // path: 'soldDate'
          },
          {
            label: 'pdp.fields.listingUpdatedOn',
            fn: mapperListingUpdatedOn
            // path: 'updatedOn'
          }
        ]
      },
      {
        items: [
          { label: 'pdp.fields.yearBuilt', path: 'details.yearBuilt' },
          {
            label: 'pdp.fields.builderModel',
            fn: mapperBuilderModel
            // path: 'raw.BuilderName, raw.ModelName'
          },
          {
            label: 'pdp.fields.storiesBuild',
            path: 'condominium.stories'
          },
          {
            label: 'pdp.fields.levelsUnit',
            fn: mapperLevelsUnit
          }
        ]
      }
    ]
  },
  exterior: {
    name: 'pdp.sections.exterior.name',
    groups: [
      {
        title: 'pdp.sections.exterior.groups.construction',
        items: [
          {
            label: 'pdp.fields.yearBuilt',
            fn: mapperConstructionYearBuilt
            // path: '{details.yearBuilt} {raw.AgeDescription}',
          },
          {
            label: 'pdp.fields.builderModel',
            fn: mapperBuilderModel
            // path: 'raw.BuilderName, raw.ModelName',
          }
        ]
      },
      {
        title: 'pdp.sections.exterior.groups.constructionDetails',
        items: [
          {
            label: 'pdp.fields.foundationType',
            path: 'details.foundationType'
          },
          { label: 'pdp.fields.roofMaterial', path: 'details.roofMaterial' },
          {
            label: 'pdp.fields.exterior',
            fn: mapperExterior
            // path: 'details.exteriorConstruction1',
          },
          {
            label: 'pdp.fields.floorCovering',
            fn: mapperFloorCovering
            // path: 'raw.FloorCovering',
          },
          { label: 'pdp.fields.sizeEstimated', path: 'details.sqft, rooms' }
        ]
      },
      {
        title: 'pdp.sections.exterior.groups.waterAndSewer',
        items: [
          { label: 'pdp.fields.waterSupply', path: 'details.waterSource' },
          { label: 'pdp.fields.sewer', path: 'details.sewer' }
        ]
      },
      {
        title: 'pdp.sections.exterior.groups.condoDetails',
        items: [
          {
            label: 'pdp.fields.ccpName',
            fn: mapperCCPName
            // path: 'condominium.condoCorpNum, condominium.condoCorp'
          },
          { label: 'pdp.fields.restrictions', path: 'raw.Restrictions' },
          {
            label: 'pdp.fields.secondaryDwellingUnit',
            fn: mapperSecondaryDwellingUnit
            // path: 'raw.HasSecondaryDwellingUnitYN'
          }
        ]
      },
      {
        title: 'pdp.sections.exterior.groups.legal',
        items: [
          { label: 'pdp.fields.brokerage', path: 'office.brokerageName' },
          { label: 'pdp.fields.legalDescription', path: 'lot.legalDescription' }
        ]
      }
    ]
  },
  features: {
    name: 'pdp.sections.features.name',
    groups: [
      {
        title: 'pdp.sections.features.groups.bedsAndBaths',
        items: [
          {
            label: 'pdp.fields.totalBeds',
            fn: mapperTotalBeds
            // path: 'details.numBedrooms, details.numBedroomsPlus'
          },
          {
            label: 'pdp.fields.baths',
            fn: mapperBaths
            // path: '{details.numBathrooms} + {details.numBathroomsPlus}'
          },
          { label: 'pdp.fields.totalEnsuites', path: 'raw.EnsuiteBathrooms' }
        ]
      },
      {
        title: 'pdp.sections.features.groups.heatingAndCooling',
        items: [
          { label: 'pdp.fields.heatingType', path: 'details.heating' },
          { label: 'pdp.fields.heatingFuel', path: 'raw.HeatingFuel' },
          {
            label: 'pdp.fields.airConditioning',
            path: 'details.airConditioning'
          },
          {
            label: 'pdp.fields.fireplaces',
            fn: (property: Property) => {
              const num = property.details.numFireplaces
              return scrubbed(num) ? num : toAffirmative(num)
            }
            // path: 'details.numFireplaces'
          },
          { label: 'pdp.fields.fuel', path: 'raw.FireplaceFuel' }
        ]
      },
      {
        title: 'pdp.sections.features.groups.parkingAndGarage',
        items: [
          {
            label: 'pdp.fields.totalParking',
            fn: mapperTotalParking
            // path: '{details.numParkingSpaces + details.numGarageSpaces}'
          },
          {
            label: 'pdp.fields.garageSpaces',
            fn: (property: Property) =>
              toSafeNumber(property.details.numGarageSpaces)
            // path: 'details.numGarageSpaces'
          },
          {
            label: 'pdp.fields.coveredSpaces',
            path: 'raw.NumberofCoveredSpaces'
          },
          { label: 'pdp.fields.garageType', path: 'details.garage' },
          { label: 'pdp.fields.driveway', path: 'details.driveway' },
          {
            label: 'pdp.fields.parkingDescription',
            fn: mapperParkingDescription
            // path: 'raw.ParkingDesc'
          },
          {
            label: 'pdp.fields.parkingType',
            fn: mapperParkingType
            // path: 'condominium.parkingType'
          }
        ]
      },
      {
        title: 'pdp.sections.features.groups.condoFeatures',
        items: [
          {
            label: 'pdp.fields.laundry',
            fn: mapperLaundry
            // path: 'condominium.ensuiteLaundry, raw.LaundryFacilities'
          },
          {
            label: 'pdp.fields.storageLocker',
            path: 'raw.StorageIncludedInListPrice'
          }
        ]
      }
    ]
  }
}

export default condoSections
