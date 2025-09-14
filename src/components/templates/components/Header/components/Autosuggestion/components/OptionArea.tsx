import React from 'react'
import Link from 'next/link'

import routes from '@configs/routes'

import { type AutosuggestionOption } from 'services/API'

import { getAreaLabel } from '../utils'

import OptionItem from './OptionItem'

const OptionArea = ({
  props,
  option
}: {
  props: React.HTMLAttributes<HTMLLIElement>
  option: AutosuggestionOption
}) => {
  const params = new URLSearchParams()
  params.set('q', `${getAreaLabel(option)}`)
  const areaUrl = `${routes.area}/?${params}`

  return (
    <OptionItem {...props}>
      <Link
        href={areaUrl}
        onClick={(e) => {
          e.preventDefault()
        }}
      >
        {getAreaLabel(option)}
      </Link>
    </OptionItem>
  )
}

export default OptionArea
