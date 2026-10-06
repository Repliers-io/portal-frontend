import formsConfig from '@configs/forms'
import type { FormFieldName, FormKey, FormsConfig } from '@defaults/forms'

export type ResolvedRequirements = {
  required: FormFieldName[]
  groups: FormFieldName[][]
}

export const resolveRequirements = (
  form: FormKey,
  fields: FormFieldName[],
  config: FormsConfig = formsConfig
): ResolvedRequirements => {
  const { required, requiredAny } = config.forms?.[form] ?? config
  const rendered = new Set(fields)
  const resolved: ResolvedRequirements = {
    required: required.filter((field) => rendered.has(field)),
    groups: []
  }

  requiredAny.forEach((group) => {
    const present = group.filter((field) => rendered.has(field))
    // A group with a single rendered member is just that member being required.
    if (present.length > 1) resolved.groups.push(present)
    else if (present.length === 1) resolved.required.push(present[0])
  })

  return resolved
}
