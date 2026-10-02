import blogConfig from '@configs/blog'
import features from '@configs/features'
import menuConfig from '@configs/menu'

import CmsService, { type CmsMenuItem } from 'services/CMS'

import { HeaderContent } from './HeaderContent'

const Header = async () => {
  // Only fetch WordPress menu if $cmsMenu added as ToolbarMenu item
  let cmsItems: CmsMenuItem[] = []
  const hasCmsMenu = menuConfig.toolbar.some(
    (item) => typeof item.item === 'string' && item.item === '$cmsMenu'
  )

  if (features.blog && hasCmsMenu) {
    try {
      // const availableSlugs = await CmsService.getBlogClient().getMenuSlugs()
      cmsItems = await CmsService.getBlogClient().getMenuBySlug(
        blogConfig.menuSlug
      )
    } catch {
      // Ignore errors fetching menu
    }
  }

  return <HeaderContent cmsItems={cmsItems} />
}

export default Header
