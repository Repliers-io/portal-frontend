import React from 'react'
import Link from 'next/link'
import queryString from 'query-string'

import routes from '@configs/routes'

import { type MapboxAddress } from 'services/Map'

import { getAddressLabel } from '../utils'

import { OptionItem } from '.'

export const OptionAddress = ({
  props,
  option
}: {
  props: React.HTMLAttributes<HTMLLIElement> & { key?: React.Key }
  option: MapboxAddress & { type: 'address' }
}) => {
  const { key, ...otherProps } = props
  const params = queryString.stringify({ q: getAddressLabel(option) })
  const addressUrl = `${routes.address}/?${params}`

  return (
    <OptionItem key={key} {...otherProps}>
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
