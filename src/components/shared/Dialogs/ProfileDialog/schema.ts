'use client'

import Joi from 'joi'

import { validatePhoneSchema } from 'utils/validators'

const schema = Joi.object({
  fname: Joi.string().trim().min(3).required().messages({
    'string.empty': 'First name is required',
    'string.min': 'First name must be at least 3 characters long'
  }),
  lname: Joi.string().trim().min(3).required().messages({
    'string.empty': 'Last name is required',
    'string.min': 'Last name must be at least 3 characters long'
  }),
  preferences: Joi.object({
    sms: Joi.boolean().default(false),
    email: Joi.boolean().default(false)
  }).default(() => ({ sms: false, email: false })),
  phone: validatePhoneSchema.allow(null, '')
})

export default schema
