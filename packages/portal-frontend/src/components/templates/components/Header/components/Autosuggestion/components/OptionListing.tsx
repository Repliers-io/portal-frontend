import React from 'react'
import Link from 'next/link'

import { ScrubbedText } from 'components/atoms'

import { type ApiListing } from 'services/API'
import { getSeoUrl } from 'utils/listings'

import { getListingLabel } from '../utils'

import { OptionItem } from '.'

export const OptionListing = ({
  props,
  option
}: {
  props: React.HTMLAttributes<HTMLLIElement> & { key?: React.Key }
  option: ApiListing & { type: 'listing' }
}) => {
  const { key, ...otherProps } = props
  return (
    <OptionItem key={key} {...otherProps}>
      <Link href={getSeoUrl(option)}>
        <ScrubbedText>{getListingLabel(option)}</ScrubbedText>
      </Link>
    </OptionItem>
  )
}
