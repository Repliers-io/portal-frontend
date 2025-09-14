'use client'

import Joi from 'joi'

import { intentionsItems } from '@defaults/estimate/types'

import { type ApiAddress } from 'services/API'
import { validatePhoneSchema } from 'utils/validators'

const numberFieldRules = Joi.number().integer().min(1).max(16).messages({
  'number.base': '{#label} must be a number',
  'number.integer': '{#label} must be an integer',
  'number.min': '{#label} cannot be less than {#limit}',
  'number.max': '{#label} cannot be more than {#limit}'
})

const priceFieldRules = Joi.number().integer().min(0).messages({
  'number.base': '{#label} must be a number',
  'number.integer': '{#label} must be an integer',
  'number.positive': '{#label} must be a positive number',
  'number.min': '{#label} must be a positive number'
})

const selectRules = Joi.string().messages({
  'any.required': '{#label} is required',
  'string.base': '{#label} must be a string',
  'string.empty': '{#label} cannot be empty'
})

const dateSchema = Joi.string()
  .pattern(/^(?:\d{4})-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01])$/)
  .messages({
    'any.required': '{#label} is required',
    'string.empty': '{#label} cannot be empty',
    'string.base': '{#label} must be a valid date format (MM/DD/YYYY)',
    'string.pattern.base': '{#label} must be a valid date format (MM/DD/YYYY)'
  })

const inputRequiredAmountRules = Joi.number()
  .integer()
  .positive()
  .min(1)
  .required()
  .messages({
    'number.base': '{#label} must be a number',
    'number.integer': '{#label} must be an integer',
    'number.positive': '{#label} must be a positive number',
    'number.min': '{#label} must be a positive number',
    'any.required': '{#label} is required'
  })

const schema = Joi.object({
  address: Joi.object<ApiAddress>({
    address: Joi.string().required().messages({
      'any.required': 'Address is required',
      'string.empty': 'Address should not be empty'
    }),
    city: Joi.string().required().messages({
      'any.required': 'City is required',
      'string.empty': 'City should not be empty',
      'string.base': 'City must be a string'
    })
  })
    .required()
    .messages({
      'any.required': 'Address is required',
      'object.base': 'Address should not be empty'
    }),
  unitNumber: Joi.string()
    .pattern(/^(?=.*\d)[A-Za-z\d]+$/)
    .max(5)
    .messages({
      'string.pattern.base': 'Apt number must contain at least one number',
      'string.max': 'Apt number must not exceed 5 characters',
      'string.base': 'Apt number must be alphanumeric'
    })
    .allow('', null),
  listingType: Joi.string().required().messages({
    'any.required': 'Listing type is required',
    'string.base': 'Listing type must be a string'
  }),

  class: Joi.string().required(),
  details: Joi.object({
    extras: Joi.string().messages({
      'string.base': 'Extras must be a string'
    }),
    numBedrooms: numberFieldRules.label('Bedrooms'),
    numBathrooms: numberFieldRules.label('Bathrooms'),
    numParkingSpaces: numberFieldRules.label('Parking Spaces').min(0).max(30),
    numGarageSpaces: numberFieldRules.label('Garage Spaces').min(0),
    style: selectRules.required().label('Style of Home'),
    sqft: Joi.number().required().integer().positive().min(1).messages({
      'any.required': 'Square Footage is required',
      'number.base': 'Square Footage must be a number',
      'number.positive': 'Square Footage must be a positive number',
      'number.integer': 'Square Footage must be an integer'
    })
  }),
  condominium: Joi.object({
    exposure: selectRules.allow('').label('Exposure'),
    pets: selectRules.allow('').label('Pets'),
    fees: Joi.object({
      maintenance: Joi.any().when(Joi.ref('/listingType'), {
        is: 'condo',
        then: inputRequiredAmountRules.label('Maintenance Fee'),
        otherwise: Joi.string().optional().allow('', null, NaN)
      })
    })
  }),
  lot: Joi.object({
    depth: Joi.number().integer().positive().allow('').messages({
      'number.base': 'Depth must be a number',
      'number.integer': 'Depth must be an integer',
      'number.positive': 'Depth must be a positive number'
    }),
    width: Joi.number().integer().positive().allow('').messages({
      'number.base': 'Width must be a number',
      'number.integer': 'Width must be an integer',
      'number.positive': 'Width must be a positive number'
    })
  }),
  taxes: Joi.object({
    annualAmount: inputRequiredAmountRules.label('Taxes')
  }),
  data: Joi.object({
    salesIntentions: Joi.object({
      sellingTimeline: Joi.string()
        .valid(...intentionsItems)
        .required()
        .messages({
          'any.only': 'Intentions must be one of the options'
        })
    }),
    purchasePrice: priceFieldRules
      .positive()
      .allow(null, '')
      .label('Purchase price'),
    purchaseDate: dateSchema.allow(null, '').label('Purchase date'),
    mortgage: Joi.object({
      balance: priceFieldRules.allow(null, '').label('Mortgage balance')
    })
  }),
  contact: Joi.object({
    fname: Joi.string().required().messages({
      'any.required': 'First name is required',
      'string.empty': 'First name should not be empty'
    }),
    lname: Joi.string().required().messages({
      'any.required': 'Last name is required',
      'string.empty': 'Last name should not be empty'
    }),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        'any.required': 'Email is required',
        'string.empty': 'Email should not be empty',
        'string.email': 'Email must be a valid email'
      }),
    phone: validatePhoneSchema.allow(null, ''),
    confirmationCode: Joi.number().required().min(100000).max(999999).messages({
      'any.required': 'Confirmation code is required',
      'any.empty': 'Confirmation code should not be empty',
      'number.base': 'Confirmation code must be a number',
      'number.min': 'Confirmation code must be 6 digits',
      'number.max': 'Confirmation code must be 6 digits'
    })
  }),
  termsAgreement: Joi.boolean().valid(true).required().messages({
    'any.required': 'Please accept the terms and conditions to proceed',
    'any.only': 'Please accept the terms and conditions to proceed'
  })
}).prefs({
  abortEarly: false,
  allowUnknown: true,
  errors: {
    wrap: { label: false }
  }
})

export default schema
