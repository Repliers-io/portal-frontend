/**
 * Header navigation config: the main toolbar, the profile dropdown, and dropdown
 * behaviour. Import as `import menu from '@configs/menu'`. Items reference built-in
 * IDs with a `$` prefix (e.g. `$map`, `$estimate`); a tenant reorders or swaps these,
 * or inserts custom `{ label, href }` entries.
 */
import {
  type DropdownConfig,
  type ProfileMenuItem,
  type ToolbarItem
} from '@templates/components/Header'

/**
 * Default toolbar menu configuration
 * Order is determined by array index unless explicitly specified
 *
 * Built-in item IDs (use with "$" prefix):
 * - $map
 * - $locations
 * - $estimate
 * - $dashboard
 * - $blog
 * - $divider
 * - $favorites
 * - $saveSearch
 * - $imageFavorites
 * - $recentlyViewed
 * - $adminAgents
 * - $adminClients
 */
const toolbarMenuConfig: ToolbarItem[] = [
  { item: '$map' },
  { item: '$locations' },
  { item: '$estimate' },
  { item: '$dashboard' },
  { item: '$blog' },
  { item: '$divider' },
  // { item: '$favorites' },
  // { item: '$saveSearch' },
  { item: '$adminAgents' },
  { item: '$adminClients' }
]

/**
 * Default profile menu configuration
 * Order is determined by array index unless explicitly specified
 *
 * Built-in item IDs (use with "$" prefix):
 * - $saveSearch
 * - $imageFavorites
 * - $recentlyViewed
 * - $profile
 * - $signOut
 */
const profileMenuConfig: ProfileMenuItem[] = [
  { item: '$favorites' },
  { item: '$saveSearch' },
  { item: '$imageFavorites' },
  { item: '$recentlyViewed' },
  { item: '$profile' },
  { item: '$signOut' }
]

/**
 * Default dropdown configuration
 */
const dropdownConfig: DropdownConfig = {
  trigger: 'click',
  variant: 'dropdown',
  anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
  transformOrigin: { vertical: 'top', horizontal: 'left' },
  nestedAnchorOrigin: { vertical: 'top', horizontal: 'right' },
  nestedTransformOrigin: { vertical: 'top', horizontal: 'left' }
}

const menuConfig = {
  toolbar: toolbarMenuConfig,
  profile: profileMenuConfig,
  dropdown: dropdownConfig
}

export default menuConfig
