import React from 'react'
import Link from 'next/link'

import routes from '@configs/routes'

import { type AutosuggestionOption } from 'services/API'

import { getAddressLabel } from '../utils'

import OptionItem from './OptionItem'

const OptionAddress = ({
  props,
  option
}: {
  props: React.HTMLAttributes<HTMLLIElement>
  option: AutosuggestionOption
}) => {
  const params = new URLSearchParams()
  params.set('q', `${getAddressLabel(option)}`)
  const addressUrl = `${routes.address}/?${params}`

  return (
    <OptionItem {...props}>
      <Link
        href={addressUrl}
        onClick={(e) => {
          e.preventDefault()
        }}
      >
        {getAddressLabel(option)}
      </Link>
    </OptionItem>
  )
}

export default OptionAddress
