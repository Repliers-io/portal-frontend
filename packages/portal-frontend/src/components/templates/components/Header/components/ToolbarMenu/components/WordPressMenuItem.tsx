'use client'

import React from 'react'

import { type CmsMenuItem } from 'services/CMS'

import { DropdownMenu } from '../../DropdownMenu'

import { convertToDropdownItem } from './utils'
export type WordPressMenuItemProps = {
  items: CmsMenuItem[]
}

// NOTE: WARN: WordpressMenuItem includes ARRAY of DropdownMenuItem's

export const WordPressMenuItem = ({ items }: WordPressMenuItemProps) => {
  if (!items?.length) return null

  return (
    <>
      {items.map(convertToDropdownItem).map((item) => (
        <DropdownMenu key={item.title} item={item} />
      ))}
    </>
  )
}
