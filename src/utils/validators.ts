'use client'

import Joi from 'joi'
import { isValidPhoneNumber } from 'libphonenumber-js'

import { phoneNumberLocale } from '@configs/i18n'

export const validateEmail = (email: string, maxLen = 70): boolean => {
  // Check if email is empty or exceeds the maximum length
  if (!email || email.length > maxLen) {
    return false
  }

  // Define the allowed characters in the local part and domain part
  const localPartRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/
  const domainPartRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

  // Split the email address into local part and domain part
  const [localPart, domainPart] = email.split('@')

  // Ensure both local part and domain part exist
  if (!localPart || !domainPart) {
    return false
  }

  // Validate the local part and domain part using regular expressions
  if (!localPartRegex.test(localPart) || !domainPartRegex.test(domainPart)) {
    return false
  }

  // Ensure the domain part doesn't start or end with a hyphen
  if (domainPart.startsWith('-') || domainPart.endsWith('-')) {
    return false
  }

  return true
}

export const validatePhone = (value: string) =>
  isValidPhoneNumber(value, phoneNumberLocale)

export const validatePhoneSchema = Joi.string()
  .trim()
  .custom((value, helpers) => {
    if (!value) return ''
    if (!isValidPhoneNumber(value, phoneNumberLocale))
      return helpers.error('libphonenumber.invalid')
    return value
  })
  .messages({
    'libphonenumber.invalid': 'Incorrect phone format',
    'string.empty': 'Phone number should not be empty',
    'any.required': 'Phone number is required'
  })
