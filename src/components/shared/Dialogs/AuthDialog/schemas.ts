import Joi from 'joi'

import { type LogInRequest, type SignUpRequest } from 'services/API'
import { validateEmail, validatePhone } from 'utils/validators'

const invalidEmail = 'Enter a valid email address'
const invalidPhone = 'Enter a valid phone number'

export const signupSchema = Joi.object<SignUpRequest>({
  fname: Joi.string().trim().required().messages({
    'string.empty': 'First name is required',
    'any.required': 'First name is required'
  }),
  lname: Joi.string().trim().required().messages({
    'string.empty': 'Last name is required',
    'any.required': 'Last name is required'
  }),
  email: Joi.string()
    .trim()
    .custom((value, helpers) =>
      !validateEmail(value) ? helpers.error('string.custom') : value
    )
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.custom': invalidEmail
    }),
  phone: Joi.string()
    .trim()
    .allow(null, '')
    .custom((value, helpers) =>
      value && !validatePhone(value) ? helpers.error('string.custom') : value
    )
    .messages({
      'string.custom': invalidPhone
    })
})

export const loginSchema = Joi.object<LogInRequest>({
  email: Joi.string()
    .trim()
    .allow(null, '')
    .custom((value, helpers) =>
      value && !validateEmail(value) ? helpers.error('string.custom') : value
    )
    .messages({
      'string.custom': invalidEmail
    }),

  phone: Joi.string()
    .trim()
    .allow(null, '')
    .custom((value, helpers) =>
      value && !validatePhone(value) ? helpers.error('string.custom') : value
    )
    .messages({
      'string.custom': invalidPhone
    })
})
