import joi from 'joi'

import { notifications } from 'providers/SaveSearchProvider'

const schema = joi.object({
  name: joi.string().trim().min(3).required().messages({
    'string.empty': 'Search name is required',
    'string.min': 'Search name must be at least 3 characters long'
  }),
  notificationFrequency: joi
    .string()
    .valid(...notifications)
    .required()
})

export default schema
