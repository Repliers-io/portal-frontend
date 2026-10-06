import type { DropdownItem } from '@templates/components/Header'

import type { CmsMenuItem } from 'services/CMS'

// Convert WordPress MenuItem to DropdownItem
export const convertToDropdownItem = (item: CmsMenuItem): DropdownItem => {
  const { title, url, children } = item

  return {
    url: url || undefined,
    title,
    children: children?.map(convertToDropdownItem)
  }
}
