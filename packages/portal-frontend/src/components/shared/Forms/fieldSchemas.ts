import dayjs from 'dayjs'
import Joi from 'joi'
import { isValidPhoneNumber } from 'libphonenumber-js'

import i18nConfig from '@configs/i18n'
import type { FormFieldName } from '@defaults/forms'

import { type ResolvedRequirements } from './requirements'

type Translate = (key: string) => string

// The contact trio every lead form opens with.
export const identityFields: FormFieldName[] = ['name', 'email', 'phone']

// A cleared text input is '', a cleared picker is null — both mean "absent",
// which is what lets an optional field skip its format rules and a required one
// report `any.required` instead of a format error.
const blank = Joi.valid('', null)

const dayjsValue = (t: Translate, field: 'date' | 'time') =>
  Joi.any()
    .custom((value, helpers) =>
      dayjs.isDayjs(value) && value.isValid()
        ? value
        : helpers.error('dayjs.invalid')
    )
    .messages({
      'any.required': t(`${field}Required`),
      'dayjs.invalid': t(`${field}Invalid`)
    })

const schemas: Record<FormFieldName, (t: Translate) => Joi.Schema> = {
  name: (t) =>
    Joi.string()
      .max(70)
      .messages({
        'string.empty': t('nameRequired'),
        'any.required': t('nameRequired'),
        'string.max': t('nameMaxLength')
      }),

  email: (t) =>
    Joi.string()
      .email({ tlds: false })
      .max(70)
      .messages({
        'string.empty': t('emailInvalid'),
        'any.required': t('emailInvalid'),
        'string.email': t('emailInvalid')
      }),

  phone: (t) =>
    Joi.string()
      .custom((value, helpers) =>
        isValidPhoneNumber(value, i18nConfig.phoneNumberLocale)
          ? value
          : helpers.error('phone.invalid')
      )
      .messages({
        'string.empty': t('phoneRequired'),
        'any.required': t('phoneRequired'),
        'phone.invalid': t('phoneInvalid')
      }),

  message: (t) =>
    Joi.string()
      .min(10)
      .max(1024)
      .messages({
        'string.empty': t('messageRequired'),
        'any.required': t('messageRequired'),
        'string.min': t('messageRequired'),
        'string.max': t('messageMaxLength')
      }),

  date: (t) =>
    dayjsValue(t, 'date').custom((value, helpers) =>
      dayjs(value).isBefore(dayjs(), 'day')
        ? helpers.error('dayjs.invalid')
        : value
    ),

  time: (t) => dayjsValue(t, 'time')
}

export const createFormSchema = <T>(
  t: Translate,
  { required }: ResolvedRequirements,
  fields: FormFieldName[]
) =>
  Joi.object<T>(
    Object.fromEntries(
      fields.map((field) => {
        const schema = schemas[field](t).empty(blank)

        return [field, required.includes(field) ? schema.required() : schema]
      })
    ) as Joi.PartialSchemaMap<T>
  )
