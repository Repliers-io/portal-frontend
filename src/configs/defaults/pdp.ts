import { type Property } from 'services/API'
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
import { scrubbed } from 'utils/properties'

const sections = {
  home: {
    name: 'pdp.sections.home.name', // ключ перевода вместо строки
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
          { label: 'pdp.fields.fronting', path: 'raw.FrontingOn' },
          {
            label: 'pdp.fields.secondaryDwellingUnit',
            fn: mapperSecondaryDwellingUnit
            // path: 'raw.HasSecondaryDwellingUnitYN'
          }
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
            label: 'pdp.fields.lotSize',
            fn: mapperLotSize
            // path: 'raw.LotSizeImpFrontage, raw.LotSizeImpDepth'
          }
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
        title: 'pdp.sections.features.groups.basement',
        items: [
          { label: 'pdp.fields.type', path: 'details.basement1' },
          {
            label: 'pdp.fields.entrance',
            fn: mapperBasementDevelopment
            // path: 'details.basement2'
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
          },
          {
            label: 'pdp.fields.sizeEstimated',
            fn: mapperSizeEstimated
            // path: 'details.sqft, rooms',
          }
        ]
      },
      {
        title: 'pdp.sections.exterior.groups.lot',
        items: [
          {
            label: 'pdp.fields.acres',
            fn: mapperAcres
            // path: 'raw.LotSizeImpFrontage, raw.LotSizeImpDepth',
          },
          {
            label: 'pdp.fields.frontage',
            fn: mapperFrontageFt
            // path: 'raw.LotSizeImpFrontage',
          },
          {
            label: 'pdp.fields.depth',
            fn: mapperDepthFt
            // path: 'raw.LotSizeImpDepth',
          },
          { label: 'pdp.fields.irregularShape', path: 'lot.irregular' },
          { label: 'pdp.fields.lotImprovements', path: 'raw.LotImprovements' }
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
        title: 'pdp.sections.exterior.groups.legal',
        items: [
          { label: 'pdp.fields.brokerage', path: 'office.brokerageName' },
          { label: 'pdp.fields.legalDescription', path: 'lot.legalDescription' }
        ]
      }
    ]
  },
  appliances: {
    name: 'pdp.sections.appliances.name',
    groups: [
      {
        title: 'pdp.sections.appliances.groups.appliancesIncluded',
        items: [
          {
            label: 'pdp.fields.appliancesIncluded',
            fn: mapperAppliancesIncluded
            // path: 'raw.AppliancesIncluded',
          }
        ]
      },
      {
        title: 'pdp.sections.appliances.groups.exclusions',
        items: [
          {
            label: 'pdp.fields.exclusions',
            fn: mapperExclusions
            // path: 'raw.Exclusions',
          }
        ]
      },
      {
        title: 'pdp.sections.appliances.groups.featuresEquipmentIncluded',
        items: [
          {
            label: 'pdp.fields.featuresEquipmentIncluded',
            fn: mapperFeaturesEquipmentIncluded
            // path: 'raw.FeaturesEquipmentIncluded'
          }
        ]
      },
      {
        title: 'pdp.sections.appliances.groups.rentalEquipment',
        items: [
          {
            label: 'pdp.fields.rentalEquipment',
            fn: mapperRentalEquipment
            // path: 'raw.RentalEquipment'
          }
        ]
      }
    ]
  },
  neighborhood: {
    name: 'pdp.sections.neighborhood.name',
    groups: [
      {
        title: '',
        items: [
          {
            // TODO: filterEmptyGroups should NOT remove groups with empty `label`

            // this label will not be shown due to the design of the section,
            // but added here temporarily to avoid filtering
            label: 'pdp.fields.neighborhoodInfluences',
            fn: mapperNeighborhoodInfluences
            // path: 'nearby.amenities'
          }
        ]
      }
    ]
  }
}

export default sections
