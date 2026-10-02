import { useMemo } from 'react'

import menuConfig from '@configs/menu'

import { type CmsMenuItem } from 'services/CMS'

import { ToolbarDivider, useToolbarItemMapper } from '../components/ToolbarMenu'
import { convertToDropdownItem } from '../components/ToolbarMenu/components/utils'
import { type DropdownItem, type ToolbarItem } from '../types'

/**
 * Hook that resolves and processes all toolbar menu items
 * Combines static config items with built-in mapper items
 * Returns both the full configItems array and dropdownItems for MegaMenu
 */
export const useHeaderMenuItems = (cmsItems: CmsMenuItem[] = []) => {
  const mapper = useToolbarItemMapper()

  // Resolve all menu items: map built-in IDs and merge with custom items
  // Apply default order = array index if not specified
  const resolvedItems = useMemo<ToolbarItem[]>(() => {
    return menuConfig.toolbar
      .map((config, index) => {
        // If item starts with "$", resolve from built-in mapper
        if (typeof config.item === 'string' && config.item.startsWith('$')) {
          const builtIn = mapper[config.item]
          if (!builtIn) return null

          // Merge: built-in provides item/if/url, config can override url/order but NOT item
          const { item: _, ...rest } = config
          return {
            ...builtIn,
            ...rest,
            order: config.order ?? index
          }
        }
        // Return custom item with default order
        return { ...config, order: config.order ?? index }
      })
      .filter(Boolean) as ToolbarItem[]
  }, [mapper])

  // Filter out items whose condition is false, sort by order
  const toolbarItems = useMemo<ToolbarItem[]>(() => {
    const filtered = resolvedItems
      .filter((config) => config.if !== false)
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))

    // Remove dividers at the start, end, or consecutive dividers
    const cleaned = filtered.filter((config, index, array) => {
      if (config.item === ToolbarDivider) {
        // Remove if first or last item
        if (index === 0 || index === array.length - 1) return false
        // Remove if next item is also a divider
        if (array[index + 1]?.item === ToolbarDivider) return false
      }
      return true
    })

    return cleaned
  }, [resolvedItems])

  // Extract dropdown items for MegaMenu (only items with children)
  const megamenuItems = useMemo<DropdownItem[]>(() => {
    const staticItems = toolbarItems
      .filter(
        (config) => config.children?.length && typeof config.item === 'string'
      )
      .map((config) => ({
        title: config.item as string,
        url: config.url || '',
        children: config.children
      }))

    // Add CMS menu items - they come pre-structured with children
    const cmsDropdownItems = cmsItems.map(convertToDropdownItem)

    return [...staticItems, ...cmsDropdownItems]
  }, [toolbarItems, cmsItems])

  return {
    toolbarItems,
    megamenuItems
  }
}
