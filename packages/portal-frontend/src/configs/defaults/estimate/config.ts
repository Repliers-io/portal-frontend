import contentConfig from '@configs/content'
import {
  type FormFields,
  type FormValues,
  type StepsConfiguration
} from '@configs/estimate'
import searchConfig from '@configs/search'

const defaultsResidential = {
  details: {
    style: '2-storey',
    sqft: 2500
  }
}

const defaultsCondo = {
  details: {
    style: 'apartment',
    sqft: 1000
  }
}

const estimateConfig = {
  // Map provider for the address preview in the estimate form.
  addressMapProvider: 'mapbox' as 'mapbox' | 'google',
  defaultBrokerageName: contentConfig.siteName,
  enableClientsAddEstimate: false,
  addStreetSuffix: false,
  searchStrategy: undefined as string | undefined,
  enableFormClose: false,

  // Estimate card home image
  showEstimateImage: true,

  estimateFormMinHeight: 692,

  // estimate aggregates _additional_ params specific to province / board
  selectOptionsParams: {} as Record<string, unknown>,

  apiFields: [
    'raw.ConstructionMaterials',
    'raw.Basement',
    'raw.HeatType',
    'condominium.exposure',
    'condominium.amenities',
    'condominium.pets',
    'details.swimmingPool',
    'details.yearBuilt',
    'details.heating',
    'details.style'
  ] as string[],

  apiFieldsRawMappings: {
    'raw.ConstructionMaterials': 'details.exteriorConstruction1',
    'raw.Basement': 'details.basement1',
    'raw.HeatType': 'details.heating'
  } as Record<string, string>,

  stepsConfiguration: {
    address: {
      title: 'Home Location',
      validation: ['address', 'unitNumber']
    },
    basicDetails: {
      title: 'Basic Property Details',
      validation: [
        'listingType',
        'details.numBedrooms',
        'details.numBathrooms',
        'details.numGarageSpaces',
        'details.numParkingSpaces'
      ]
    },
    homeDetails: {
      title: 'Home Characteristics',
      validation: [
        'details.exteriorConstruction1',
        'condominium.exposure',
        'condominium.amenities',
        'condominium.pets',
        'details.basement1',
        'details.heating',
        'details.style',
        'details.sqft'
      ]
    },
    advancedDetails: {
      title: 'Lot Information & Expenses',
      condoTitle: 'Expenses',
      validation: [
        'lot.depth',
        'lot.width',
        'lot.acres',
        'taxes.annualAmount',
        'condominium.fees.maintenance',
        'details.extras'
      ]
    },
    intentions: {
      title: 'Intentions',
      validation: ['data.salesIntentions.sellingTimeline']
    },
    contact: {
      title: 'Contact Information',
      validation: [
        'contact.fname',
        'contact.lname',
        'contact.email',
        'contact.phone'
      ]
    },
    confirmation: {
      title: 'Confirmation',
      validation: ['contact.confirmationCode']
    }
  } as StepsConfiguration,

  serverValidationFields: ['address'] as FormFields,

  // the list of fields which should survive the purge of empty values
  emptyExceptions: [] as FormFields,

  condoFieldsToRemove: [
    'lot.acres',
    'lot.depth',
    'lot.width',
    'details.numGarageSpaces'
  ] as FormFields,

  residentialFieldsToRemove: ['condominium'] as FormFields,

  basicFieldsToRemove: [
    'unitNumber',
    'point',
    'contact',
    'listingType',
    'lot.sqft',

    'address.region',
    'address.country',
    'address.address',
    'address.fullAddress',
    'address.streetSuffixFull',
    'address.mapbox_id',
    'address.google_place_id',
    'details.numFireplaces'
  ] as FormFields,

  // using for prevent removing data fields in cleanFormData when send estimate
  protectedDataFields: [] as string[],

  defaultsResidential,

  defaultsCondo,

  defaultValues: {
    address: undefined,
    point: undefined,
    unitNumber: '',
    boardId: searchConfig.defaultBoardId,
    listingType: 'residential',
    estimateId: undefined,
    clientId: undefined,
    contact: {
      fname: '',
      lname: '',
      email: '',
      phone: '',
      confirmationCode: ''
    },
    details: {
      extras: ' ',
      numBedrooms: 1,
      numBathrooms: 1,
      numParkingSpaces: 1,
      numGarageSpaces: 0,
      numFireplaces: 0,
      sqft: defaultsResidential.details.sqft,
      style: defaultsResidential.details.style,
      exteriorConstruction1: [],
      basement1: [],
      heating: [],
      yearBuilt: '',
      swimmingPool: ''
    },
    lot: {
      depth: '',
      width: '',
      acres: ''
    },
    taxes: {
      annualAmount: ''
    },
    condominium: {
      exposure: '',
      amenities: [],
      pets: '',
      fees: {
        maintenance: null
      }
    },
    data: {
      salesIntentions: {
        sellingTimeline: 'asap'
      },
      imageUrl: ''
    },
    sendEmailNow: true
    // sendEmailMonthly: false,
  } as FormValues
}

export default estimateConfig
