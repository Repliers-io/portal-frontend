import sections from '@configs/pdp-sections'

import { type ApiListing } from 'services/API'
import {
  mapperAssociationFeePOTL,
  mapperBaths,
  mapperBuilderModel,
  mapperCategory,
  mapperCCPName,
  mapperCondoAmenities,
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
  mapperNearbyAmenities,
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
import { scrubbed } from 'utils/listings'

const condoSections = {
  ...sections,
  home: {
    name: 'PDP.sections.home.name',
    groups: [
      {
        items: [
          {
            label: 'PDP.fields.category',
            fn: mapperCategory
            // path: 'class'
          },
          { label: 'PDP.fields.style', path: 'details.propertyType' },
          { label: 'PDP.fields.type', path: 'details.style' },
          { label: 'PDP.fields.fronting', path: 'raw.FrontingOn' }
        ]
      },
      {
        items: [
          { label: 'PDP.fields.titleForm', path: 'raw.TitleForm' },
          {
            label: 'PDP.fields.taxesYear',
            fn: mapperTaxesYear
            // path: 'taxes.annualAmount, taxes.assessmentYear'
          },
          {
            label: 'PDP.fields.associationFeePOTL',
            fn: mapperAssociationFeePOTL
            // path: 'raw.AssocCommonAreaFeeAmt, raw.AssocFeeFrequency'
          },
          {
            label: 'PDP.fields.condoFees',
            fn: mapperCondoFees
            // path: 'condominium.fees.maintenance'
          },
          {
            label: 'PDP.fields.feeIncludes',
            fn: mapperFeeIncludes
            //  path: 'raw.FeeIncludes'
          },
          {
            label: 'PDP.fields.specialAssessment',
            fn: mapperSpecialAssessment
            // path: 'raw.AssessmentYear, raw.AssessmentAmount'
          }
        ]
      },
      {
        items: [
          { label: 'PDP.fields.status', path: 'lastStatus' },
          {
            label: 'PDP.fields.daysOnMarket',
            fn: mapperDaysOnMarket
            // path: 'listDate, soldDate'
          },
          {
            label: 'PDP.fields.listDate',
            fn: mapperListDate
            // path: 'listDate'
          },
          {
            label: 'PDP.fields.soldDate',
            fn: mapperSoldDate
            // path: 'soldDate'
          },
          {
            label: 'PDP.fields.listingUpdatedOn',
            fn: mapperListingUpdatedOn
            // path: 'updatedOn'
          }
        ]
      },
      {
        items: [
          { label: 'PDP.fields.yearBuilt', path: 'details.yearBuilt' },
          {
            label: 'PDP.fields.builderModel',
            fn: mapperBuilderModel
            // path: 'raw.BuilderName, raw.ModelName'
          },
          {
            label: 'PDP.fields.storiesBuild',
            path: 'condominium.stories'
          },
          {
            label: 'PDP.fields.levelsUnit',
            fn: mapperLevelsUnit
          }
        ]
      }
    ]
  },
  exterior: {
    name: 'PDP.sections.exterior.name',
    groups: [
      {
        title: 'PDP.sections.exterior.groups.construction',
        items: [
          {
            label: 'PDP.fields.yearBuilt',
            fn: mapperConstructionYearBuilt
            // path: '{details.yearBuilt} {raw.AgeDescription}',
          },
          {
            label: 'PDP.fields.builderModel',
            fn: mapperBuilderModel
            // path: 'raw.BuilderName, raw.ModelName',
          }
        ]
      },
      {
        title: 'PDP.sections.exterior.groups.constructionDetails',
        items: [
          {
            label: 'PDP.fields.foundationType',
            path: 'details.foundationType'
          },
          { label: 'PDP.fields.roofMaterial', path: 'details.roofMaterial' },
          {
            label: 'PDP.fields.exterior',
            fn: mapperExterior
            // path: 'details.exteriorConstruction1',
          },
          {
            label: 'PDP.fields.floorCovering',
            fn: mapperFloorCovering
            // path: 'raw.FloorCovering',
          },
          { label: 'PDP.fields.sizeEstimated', path: 'details.sqft, rooms' }
        ]
      },
      {
        title: 'PDP.sections.exterior.groups.waterAndSewer',
        items: [
          { label: 'PDP.fields.waterSupply', path: 'details.waterSource' },
          { label: 'PDP.fields.sewer', path: 'details.sewer' }
        ]
      },
      {
        title: 'PDP.sections.exterior.groups.condoDetails',
        items: [
          {
            label: 'PDP.fields.ccpName',
            fn: mapperCCPName
            // path: 'condominium.condoCorpNum, condominium.condoCorp'
          },
          { label: 'PDP.fields.restrictions', path: 'raw.Restrictions' },
          {
            label: 'PDP.fields.secondaryDwellingUnit',
            fn: mapperSecondaryDwellingUnit
            // path: 'raw.HasSecondaryDwellingUnitYN'
          }
        ]
      },
      {
        title: 'PDP.sections.exterior.groups.legal',
        items: [
          { label: 'PDP.fields.brokerage', path: 'office.brokerageName' },
          { label: 'PDP.fields.legalDescription', path: 'lot.legalDescription' }
        ]
      }
    ]
  },
  features: {
    name: 'PDP.sections.features.name',
    groups: [
      {
        title: 'PDP.sections.features.groups.bedsAndBaths',
        items: [
          {
            label: 'PDP.fields.totalBeds',
            fn: mapperTotalBeds
            // path: 'details.numBedrooms, details.numBedroomsPlus'
          },
          {
            label: 'PDP.fields.baths',
            fn: mapperBaths
            // path: '{details.numBathrooms} + {details.numBathroomsPlus}'
          },
          { label: 'PDP.fields.totalEnsuites', path: 'raw.EnsuiteBathrooms' }
        ]
      },
      {
        title: 'PDP.sections.features.groups.heatingAndCooling',
        items: [
          { label: 'PDP.fields.heatingType', path: 'details.heating' },
          { label: 'PDP.fields.heatingFuel', path: 'raw.HeatingFuel' },
          {
            label: 'PDP.fields.airConditioning',
            path: 'details.airConditioning'
          },
          {
            label: 'PDP.fields.fireplaces',
            fn: (listing: ApiListing) => {
              const num = listing.details.numFireplaces
              return scrubbed(num) ? num : toAffirmative(num)
            }
            // path: 'details.numFireplaces'
          },
          { label: 'PDP.fields.fuel', path: 'raw.FireplaceFuel' }
        ]
      },
      {
        title: 'PDP.sections.features.groups.parkingAndGarage',
        items: [
          {
            label: 'PDP.fields.totalParking',
            fn: mapperTotalParking
          },
          {
            label: 'PDP.fields.garageSpaces',
            fn: (listing: ApiListing) =>
              toSafeNumber(listing.details.numGarageSpaces)
            // path: 'details.numGarageSpaces'
          },
          {
            label: 'PDP.fields.drivewaySpaces',
            fn: (listing: ApiListing) =>
              toSafeNumber(listing.details.numDrivewaySpaces)
            // path: 'details.numDrivewaySpaces'
          },
          {
            label: 'PDP.fields.coveredSpaces',
            path: 'raw.NumberofCoveredSpaces'
          },
          { label: 'PDP.fields.garageType', path: 'details.garage' },
          { label: 'PDP.fields.driveway', path: 'details.driveway' },
          {
            label: 'PDP.fields.parkingDescription',
            fn: mapperParkingDescription
            // path: 'raw.ParkingDesc'
          },
          {
            label: 'PDP.fields.parkingType',
            fn: mapperParkingType
            // path: 'condominium.parkingType'
          }
        ]
      },
      {
        title: 'PDP.sections.features.groups.condoFeatures',
        items: [
          {
            label: 'PDP.fields.laundry',
            fn: mapperLaundry
            // path: 'condominium.ensuiteLaundry, raw.LaundryFacilities'
          },
          {
            label: 'PDP.fields.storageLocker',
            path: 'raw.StorageIncludedInListPrice'
          }
        ]
      }
    ]
  },
  condominium: {
    name: 'PDP.sections.condominium.name',
    groups: [
      {
        title: 'PDP.sections.condominium.groups.nearbyAmenities',
        items: [
          { label: 'PDP.fields.nearbyAmenities', fn: mapperNearbyAmenities }
        ]
      },
      {
        title: 'PDP.sections.condominium.groups.condoAmenities',
        items: [
          { label: 'PDP.fields.condoAmenities', fn: mapperCondoAmenities }
        ]
      },
      {
        items: [{ label: 'PDP.fields.pets', path: 'condominium.pets' }]
      }
    ]
  }
}

export default condoSections
