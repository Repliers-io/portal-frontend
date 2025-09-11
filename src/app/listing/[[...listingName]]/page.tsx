import { headers } from 'next/headers'
import type React from 'react'

import content from '@configs/content'
import { Property404Template, PropertyPageTemplate } from '@templates'

import { formatMetadata } from 'utils/properties'
import { getProtocolHost } from 'utils/urls'

import { type Params, type SearchParams } from './types'
import { fetchNearbies, fetchProperty, parseParams } from './utils'

type PropertyPageProps = {
  params: Params
  searchParams: SearchParams
}

// NextJS SSR metadata generation
export const generateMetadata = async (props: PropertyPageProps) => {
  const searchParams = await props.searchParams
  const params = await props.params
  const host = getProtocolHost(await headers())
  const { listingId, boardId } = parseParams(params, searchParams)
  try {
    const property = await fetchProperty(listingId, boardId)
    return formatMetadata(property, host)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: any) {
    return content.missingPropertyMetadata
  }
}

const PropertyPage = async (props: PropertyPageProps) => {
  const searchParams = await props.searchParams
  const params = await props.params
  const { listingId, boardId, listingName } = parseParams(params, searchParams)
  try {
    const property = await fetchProperty(listingId, boardId)
    return <PropertyPageTemplate property={property} />
  } catch (error: any) {
    const properties = await fetchNearbies(listingName)
    return (
      <Property404Template
        listingName={listingName}
        properties={properties}
        error={error}
      />
    )
  }
}

export default PropertyPage
