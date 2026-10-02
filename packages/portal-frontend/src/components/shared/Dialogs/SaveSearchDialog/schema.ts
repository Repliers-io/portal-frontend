import joi from 'joi'

import { notifications } from 'providers/SaveSearchProvider'

export const searchNameMaxLength = 50

const schema = joi.object({
  name: joi
    .string()
    .trim()
    .min(3)
    .max(searchNameMaxLength)
    .required()
    .messages({
      'string.empty': 'Search name is required',
      'string.min': 'Search name must be at least 3 characters long',
      'string.max': `Search name must be ${searchNameMaxLength} characters or less`
    }),
  notificationFrequency: joi
    .string()
    .valid(...notifications)
    .required()
})

export default schema
