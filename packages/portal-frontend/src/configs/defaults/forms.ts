export type FormFieldName =
  | 'name'
  | 'email'
  | 'phone'
  | 'message'
  | 'date'
  | 'time'

export type FormKey =
  | 'contact'
  | 'requestInfo'
  | 'tour'
  | 'meeting'
  | 'jobApplication'
  | 'subscribe'

export type FormRequirements = {
  required: FormFieldName[]
  /** Groups where at least one member must be filled. */
  requiredAny: FormFieldName[][]
}

/** A form key present in `forms` replaces the global rules for that form. */
export type FormsConfig = FormRequirements & {
  forms?: Partial<Record<FormKey, FormRequirements>>
}

const config: FormsConfig = {
  required: ['name', 'email', 'phone', 'message', 'date', 'time'],
  requiredAny: [],
  // The PDP enquiry form prefills its message and has never enforced it.
  // A tenant that declares `forms` replaces this map wholesale — re-list any
  // block it still needs.
  forms: {
    requestInfo: {
      required: ['name', 'email', 'phone'],
      requiredAny: []
    }
  }
}

export default config
