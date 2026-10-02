import React from 'react'

import { type ApiLocation } from 'services/API'

import {
  OptionAddress,
  OptionListing,
  OptionLoader,
  OptionLocation
} from './index'

interface AutosuggestOptionProps {
  props: React.HTMLAttributes<HTMLLIElement> & { key?: React.Key }
  option: any
  onAdd?: (location: ApiLocation) => void
  onRemove?: (location: ApiLocation) => void
}

export const AutosuggestOption: React.FC<AutosuggestOptionProps> = ({
  props,
  option,
  onAdd,
  onRemove
}) => {
  const key = props.key || props.id

  switch (option.type) {
    case 'loader':
      return <OptionLoader key="loader" />
    case 'area':
    case 'city':
    case 'neighborhood': {
      return (
        <OptionLocation
          option={option}
          props={props}
          key={key}
          onAdd={onAdd}
          onRemove={onRemove}
        />
      )
    }
    case 'address':
      return <OptionAddress option={option} props={props} key={key} />
    case 'listing':
      return <OptionListing option={option} props={props} key={key} />
    default:
      return null
  }
}
