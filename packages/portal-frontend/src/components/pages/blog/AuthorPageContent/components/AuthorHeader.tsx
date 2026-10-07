import { Avatar, Box, Stack, Typography } from '@mui/material'

import { CmsContentRenderer } from '@shared/CmsContentRenderer'

import { type ContentAuthor } from 'services/CMS'

import { AuthorInfoCards } from './AuthorInfoCards'

export const AuthorHeader = ({ author }: { author: ContentAuthor }) => {
  const { acf } = author
  const title = acf?.title as string
  const org = acf?.organization as string
  const homesClosed = acf?.homes_closed as string | undefined
  const emailPublic = acf?.email_public as string | undefined
  const phone = acf?.phone as string | undefined

  const content = (author.acf?.profile || author.acf?.about) as string

  return (
    <Box>
      <Avatar
        src={author.avatar}
        alt=""
        variant="square"
        sx={{
          float: { xs: 'none', md: 'left' },
          width: { xs: '100%', sm: 512 },
          height: 'auto',
          aspectRatio: '4 / 5',
          mr: { xs: 0, sm: 'auto', md: 6 },
          ml: { xs: 0, sm: 'auto', md: 0 },
          mb: 2,
          borderRadius: 1
        }}
      />

      <Stack spacing={0.5} sx={{ mb: 3 }}>
        <Typography
          variant="h2"
          component="h1"
          fontSize={48}
          lineHeight={1}
          color="secondary.dark"
        >
          {author.name}
        </Typography>
        {title && (
          <Typography variant="h5" color="primary.main">
            {title}
          </Typography>
        )}
        {org && (
          <Typography variant="body2" color="text.secondary">
            {org}
          </Typography>
        )}
      </Stack>

      <AuthorInfoCards
        homesClosed={homesClosed}
        emailPublic={emailPublic}
        phone={phone}
        firstName={author.name?.split(' ')[0]}
      />

      {content && (
        <Box
          sx={{
            mb: -4,
            '& b, & strong': {
              fontFamily: 'Poppins, sans-serif'
            },
            '& p': {
              display: 'flow-root',
              mb: 2,
              '&:last-child': {
                mb: 0
              }
            },
            '& ul, & ol': {
              display: 'flow-root'
            },
            '& li': {
              ml: 2
            }
          }}
        >
          <CmsContentRenderer content={content} format="raw" />
        </Box>
      )}
    </Box>
  )
}
