import React from 'react'

import {
  OptionAddress,
  OptionListing,
  OptionLoader,
  OptionLocation
} from './index'

interface AutosuggestOptionProps {
  props: React.HTMLAttributes<HTMLLIElement> & { key?: React.Key }
  option: any
}

export const AutosuggestOption: React.FC<AutosuggestOptionProps> = ({
  props,
  option
}) => {
  const { key, ...otherProps } = props

  switch (option.type) {
    case 'loader':
      return <OptionLoader key="loader" />
    case 'area':
    case 'city':
    case 'neighborhood': {
      return (
        <OptionLocation
          key={option.locationId}
          props={otherProps}
          option={option}
        />
      )
    }
    case 'address':
      return <OptionAddress key={key} props={otherProps} option={option} />
    case 'listing':
      return <OptionListing key={key} props={otherProps} option={option} />
    default:
      return null
  }
}
