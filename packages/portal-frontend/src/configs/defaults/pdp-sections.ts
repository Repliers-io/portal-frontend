import { type ApiListing } from 'services/API'
import {
  mapperAcres,
  mapperAppliancesIncluded,
  mapperAssociationFeePOTL,
  mapperBasementDevelopment,
  mapperBaths,
  mapperBuilderModel,
  mapperCategory,
  mapperConstructionYearBuilt,
  mapperDaysOnMarket,
  mapperDepthFt,
  mapperExclusions,
  mapperExterior,
  mapperFeaturesEquipmentIncluded,
  mapperFloorCovering,
  mapperFrontageFt,
  mapperListDate,
  mapperListingUpdatedOn,
  mapperLotSize,
  mapperNeighborhoodInfluences,
  mapperParkingDescription,
  mapperParkingType,
  mapperRentalEquipment,
  mapperSecondaryDwellingUnit,
  mapperSizeEstimated,
  mapperSoldDate,
  mapperTaxesYear,
  mapperTotalBeds,
  mapperTotalParking
} from 'utils/dataMapper/mappers'
import { toAffirmative, toSafeNumber } from 'utils/formatters'
import { scrubbed } from 'utils/listings'

const sections = {
  home: {
    name: 'PDP.sections.home.name', // translation key instead of a plain string
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
          { label: 'PDP.fields.fronting', path: 'raw.FrontingOn' },
          {
            label: 'PDP.fields.secondaryDwellingUnit',
            fn: mapperSecondaryDwellingUnit
            // path: 'raw.HasSecondaryDwellingUnitYN'
          }
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
            label: 'PDP.fields.lotSize',
            fn: mapperLotSize
            // path: 'raw.LotSizeImpFrontage, raw.LotSizeImpDepth'
          }
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
        title: 'PDP.sections.features.groups.basement',
        items: [
          { label: 'PDP.fields.type', path: 'details.basement1' },
          {
            label: 'PDP.fields.entrance',
            fn: mapperBasementDevelopment
            // path: 'details.basement2'
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
          },
          {
            label: 'PDP.fields.sizeEstimated',
            fn: mapperSizeEstimated
            // path: 'details.sqft, rooms',
          }
        ]
      },
      {
        title: 'PDP.sections.exterior.groups.lot',
        items: [
          {
            label: 'PDP.fields.acres',
            fn: mapperAcres
            // path: 'raw.LotSizeImpFrontage, raw.LotSizeImpDepth',
          },
          {
            label: 'PDP.fields.frontage',
            fn: mapperFrontageFt
            // path: 'raw.LotSizeImpFrontage',
          },
          {
            label: 'PDP.fields.depth',
            fn: mapperDepthFt
            // path: 'raw.LotSizeImpDepth',
          },
          { label: 'PDP.fields.irregularShape', path: 'lot.irregular' },
          { label: 'PDP.fields.lotImprovements', path: 'raw.LotImprovements' }
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
        title: 'PDP.sections.exterior.groups.legal',
        items: [
          { label: 'PDP.fields.brokerage', path: 'office.brokerageName' },
          { label: 'PDP.fields.legalDescription', path: 'lot.legalDescription' }
        ]
      }
    ]
  },
  appliances: {
    name: 'PDP.sections.appliances.name',
    groups: [
      {
        title: 'PDP.sections.appliances.groups.appliancesIncluded',
        items: [
          {
            label: 'PDP.fields.appliancesIncluded',
            fn: mapperAppliancesIncluded
            // path: 'raw.AppliancesIncluded',
          }
        ]
      },
      {
        title: 'PDP.sections.appliances.groups.exclusions',
        items: [
          {
            label: 'PDP.fields.exclusions',
            fn: mapperExclusions
            // path: 'raw.Exclusions',
          }
        ]
      },
      {
        title: 'PDP.sections.appliances.groups.featuresEquipmentIncluded',
        items: [
          {
            label: 'PDP.fields.featuresEquipmentIncluded',
            fn: mapperFeaturesEquipmentIncluded
            // path: 'raw.FeaturesEquipmentIncluded'
          }
        ]
      },
      {
        title: 'PDP.sections.appliances.groups.rentalEquipment',
        items: [
          {
            label: 'PDP.fields.rentalEquipment',
            fn: mapperRentalEquipment
            // path: 'raw.RentalEquipment'
          }
        ]
      }
    ]
  },
  neighborhood: {
    name: 'PDP.sections.neighborhood.name',
    groups: [
      {
        title: '',
        items: [
          {
            // TODO: filterEmptyGroups should NOT remove groups with empty `label`

            // this label will not be shown due to the design of the section,
            // but added here temporarily to avoid filtering
            label: 'PDP.fields.neighborhoodInfluences',
            fn: mapperNeighborhoodInfluences
            // path: 'nearby.amenities'
          }
        ]
      }
    ]
  }
}

export default sections
