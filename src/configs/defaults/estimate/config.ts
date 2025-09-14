import {
  type EstimateListingType,
  type FormFields,
  type FormValues,
  type StepsConfiguration
} from '@configs/estimate'
import {
  TYPE_CONDO,
  TYPE_MULTI_FAMILY,
  TYPE_RESIDENTIAL,
  TYPE_SEMIDETACHED,
  TYPE_TOWNHOME
} from '@configs/filter-types'
import searchConfig from '@configs/search'

// justinhavre-avm temporary enable add estimate button
export const enableClientsAddEstimate = false
export const addStreetSuffix = false

// Estimate card home image
export const showEstimateImage = true

export const estimateFormMinHeight = 692

// estimate aggregates _additional_ params specific to province / board
export const selectOptionsParams = {}

export const apiFields = [
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
]

export const apiFieldsRawMappings: Partial<
  Record<(typeof apiFields)[number], string>
> = {
  'raw.ConstructionMaterials': 'details.exteriorConstruction1',
  'raw.Basement': 'details.basement1',
  'raw.HeatType': 'details.heating'
}

export const stepsConfiguration: StepsConfiguration = {
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
}

export const serverValidationFields: FormFields = ['address']

// the list of fields which should survive the purge of empty values
export const emptyExceptions: FormFields = []

export const condoFieldsToRemove: FormFields = [
  'lot.acres',
  'lot.depth',
  'lot.width',
  'details.numGarageSpaces'
]

export const residentialFieldsToRemove: FormFields = ['condominium']

export const basicFieldsToRemove: FormFields = [
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
]

// using for prevent removing data fields in cleanFormData when send estimate
export const protectedDataFields = []

export const defaultsResidential = {
  details: {
    style: '2-storey',
    sqft: 2500
  }
}

export const defaultsCondo = {
  details: {
    style: 'apartment',
    sqft: 1000
  }
}

export const listingTypeMappings: Partial<
  Record<EstimateListingType, string[]>
> = {
  condo: TYPE_CONDO,
  townhome: TYPE_TOWNHOME,
  residential: TYPE_RESIDENTIAL,
  multiFamily: TYPE_MULTI_FAMILY,
  semiDetached: TYPE_SEMIDETACHED
}

export const defaultValues: FormValues = {
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
}
