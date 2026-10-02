import defaultsConfig, { type FormsConfig } from '@defaults/forms'

import { resolveRequirements } from './requirements'

const defaults: FormsConfig = {
  required: ['name', 'email', 'phone', 'message', 'date', 'time'],
  requiredAny: []
}

const movesmartly: FormsConfig = {
  required: ['name', 'date', 'time'],
  requiredAny: [['email', 'phone']],
  forms: {
    jobApplication: {
      required: ['name', 'email', 'phone', 'message'],
      requiredAny: []
    }
  }
}

const contactFields = ['name', 'email', 'phone', 'message'] as const

describe('resolveRequirements', () => {
  it('keeps only the fields the form renders', () => {
    expect(
      resolveRequirements('contact', [...contactFields], defaults)
    ).toEqual({
      required: ['name', 'email', 'phone', 'message'],
      groups: []
    })
  })

  it('drops a required field the form does not render', () => {
    const { required } = resolveRequirements(
      'contact',
      ['name', 'email', 'phone'],
      defaults
    )

    expect(required).not.toContain('message')
  })

  it('turns a group into a group when both members are rendered', () => {
    expect(
      resolveRequirements('contact', [...contactFields], movesmartly)
    ).toEqual({
      required: ['name'],
      groups: [['email', 'phone']]
    })
  })

  it('degrades a group to a required field when only one member is rendered', () => {
    expect(resolveRequirements('subscribe', ['email'], movesmartly)).toEqual({
      required: ['email'],
      groups: []
    })
  })

  it('ignores a group whose members are all absent', () => {
    expect(resolveRequirements('contact', ['name'], movesmartly)).toEqual({
      required: ['name'],
      groups: []
    })
  })

  it('replaces the global rules with a per-form block', () => {
    expect(
      resolveRequirements('jobApplication', [...contactFields], movesmartly)
    ).toEqual({
      required: ['name', 'email', 'phone', 'message'],
      groups: []
    })
  })
})

describe('default config', () => {
  it('leaves the message optional on the request-info form', () => {
    const { required } = resolveRequirements(
      'requestInfo',
      ['name', 'email', 'phone', 'message'],
      defaultsConfig
    )

    expect(required).toEqual(['name', 'email', 'phone'])
  })

  it('requires everything the contact form renders', () => {
    const { required } = resolveRequirements(
      'contact',
      ['name', 'email', 'phone', 'message'],
      defaultsConfig
    )

    expect(required).toEqual(['name', 'email', 'phone', 'message'])
  })
})
