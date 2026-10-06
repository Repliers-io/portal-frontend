// Input attributes that suppress browser/password-manager autofill (and its highlight).
export const noAutofillInputProps = {
  autoComplete: 'one-time-code',
  autoCorrect: 'off',
  autoCapitalize: 'off',
  spellCheck: false,
  'data-form-type': 'other',
  'data-lpignore': 'true',
  'data-1p-ignore': 'true'
}
