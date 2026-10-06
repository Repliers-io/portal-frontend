'use client'

import { createContext, type ReactNode, useContext } from 'react'

import type { FormFieldName } from '@defaults/forms'

import { type ResolvedRequirements, resolveRequirements } from './requirements'

// A form that forgets the provider falls back to the global config rules.
const fallback = resolveRequirements('contact', [
  'name',
  'email',
  'phone',
  'message'
])

const RequirementsContext = createContext<ResolvedRequirements>(fallback)

export const FormRequirements = ({
  requirements,
  children
}: {
  requirements: ResolvedRequirements
  children: ReactNode
}) => (
  <RequirementsContext.Provider value={requirements}>
    {children}
  </RequirementsContext.Provider>
)

export const useFieldRequirement = (name: FormFieldName) => {
  const { required, groups } = useContext(RequirementsContext)

  return {
    required: required.includes(name),
    // A group member carries no asterisk — RequiredAnyHint speaks for the pair.
    grouped: groups.some((group) => group.includes(name))
  }
}

export const useRequiredGroups = () => useContext(RequirementsContext).groups
