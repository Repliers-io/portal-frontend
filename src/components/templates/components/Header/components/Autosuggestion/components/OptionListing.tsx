import React from 'react'
import Link from 'next/link'

import { type AutosuggestionOption, type Property } from 'services/API'
import { getSeoUrl } from 'utils/properties'

import { getListingLabel } from '../utils'

import OptionItem from './OptionItem'

const OptionListing = ({
  props,
  option
}: {
  props: React.HTMLAttributes<HTMLLIElement>
  option: AutosuggestionOption
}) => {
  return (
    <OptionItem {...props}>
      <Link href={getSeoUrl(option.source as Property)}>
        {getListingLabel(option)}
        {/* <Typography variant="caption">{mlsNumber}</Typography> */}
      </Link>
    </OptionItem>
  )
}

export default OptionListing
