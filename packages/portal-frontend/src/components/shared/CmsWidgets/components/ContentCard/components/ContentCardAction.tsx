import { useTranslations } from 'next-intl'

import { Button } from '@mui/material'

interface ContentCardActionProps {
  linkUrl: string
}

// Isomorphic `useTranslations` (works in both server and client trees) — this
// leaf is rendered by server CMS widgets AND by the client blog-index forks
// (`BlogPostsGrid`, `_urbn/BlogIndexPageContent`); `getTranslations` is
// server-only and crashes when the component lands in the client bundle.
export const ContentCardAction = ({ linkUrl }: ContentCardActionProps) => {
  const t = useTranslations('CmsWidgets')

  return (
    <Button
      color="primary"
      variant="outlined"
      href={linkUrl}
      sx={{
        mt: 2,
        alignSelf: 'flex-start',
        width: { xs: '100%', sm: 'auto' }
      }}
    >
      {t('readFullArticle')}
    </Button>
  )
}
