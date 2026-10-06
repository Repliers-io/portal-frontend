'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

import { type ListingEnrichedData } from 'services/MoveSmartly'

type EnrichmentState = {
  data: ListingEnrichedData | null
  loading: boolean
}

const ListingEnrichmentContext = createContext<EnrichmentState>({
  data: null,
  loading: false
})

export const ListingEnrichmentProvider = ({
  children,
  mlsNumber
}: {
  children: React.ReactNode
  mlsNumber: string
}) => {
  const [state, setState] = useState<EnrichmentState>({
    data: null,
    loading: true
  })

  useEffect(() => {
    setState({ data: null, loading: true })
    fetch(`/api/listing-enrichment?mlsNumber=${encodeURIComponent(mlsNumber)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => setState({ data: json ?? null, loading: false }))
      .catch(() => setState({ data: null, loading: false }))
  }, [mlsNumber])

  return (
    <ListingEnrichmentContext.Provider value={state}>
      {children}
    </ListingEnrichmentContext.Provider>
  )
}

export const useListingEnrichment = (): ListingEnrichedData | null =>
  useContext(ListingEnrichmentContext).data

// A null `data` on its own cannot tell "still fetching" from "nothing to show", and the
// enrichment call takes seconds — sections that hold their place while it runs need this.
export const useListingEnrichmentLoading = (): boolean =>
  useContext(ListingEnrichmentContext).loading
