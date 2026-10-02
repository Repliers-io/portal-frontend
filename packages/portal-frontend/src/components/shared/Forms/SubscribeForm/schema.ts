import Joi from 'joi'

export type SubscribeFormValues = {
  email: string
}

export const createSubscribeFormSchema = (t: (key: string) => string) =>
  Joi.object<SubscribeFormValues>({
    email: Joi.string()
      .required()
      .email({ tlds: false })
      .max(70)
      .messages({
        'string.empty': t('emailInvalid'),
        'string.email': t('emailInvalid')
      })
  })
