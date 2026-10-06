import { type ReactNode } from 'react'

type ListingProvidersProps = {
  listingId: string
  lat: number
  lng: number
  children: ReactNode
}

// Wraps the listing template in tenant-specific data providers. The default
// build has none, so children render as-is. Tenants that enrich the PDP
// override this via a _<tenant>/ fork.
export const ListingProviders = ({ children }: ListingProvidersProps) => (
  <>{children}</>
)
