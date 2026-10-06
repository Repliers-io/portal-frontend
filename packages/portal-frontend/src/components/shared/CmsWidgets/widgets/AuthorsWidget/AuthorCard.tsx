import Image from 'next/image'
import Link from 'next/link'

import { Box, Typography } from '@mui/material'

import routes from '@configs/routes'

import type { ContentAuthor } from 'services/CMS'

interface AuthorCardProps {
  author: ContentAuthor
}

const AuthorCard = ({ author }: AuthorCardProps) => {
  const authorUrl = `${routes.author}/${author.slug || author.id}`

  const avatarUrl = author.avatar || null

  // Get title from ACF if available, otherwise use bio
  const subtitle = (author.acf?.title || author.bio) as string | undefined

  return (
    <Link
      href={authorUrl}
      style={{ display: 'block', height: '100%', width: '100%' }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: 1,
          overflow: 'hidden',
          bgcolor: 'grey.200',
          '&:hover img': {
            transform: 'scale(1.05)'
          }
        }}
      >
        {avatarUrl && (
          <Image
            src={avatarUrl}
            alt={author.name}
            fill
            unoptimized
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{
              objectFit: 'cover',
              transition: 'transform 0.3s ease'
            }}
          />
        )}
        <Box
          sx={{
            position: 'absolute',
            bottom: -1,
            left: -1,
            right: -1,
            p: 1.5,
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
            background: 'rgba(0,0,0, 0.2)',
            backdropFilter: 'blur(60px)'
          }}
        >
          <Typography
            variant="h5"
            color="common.white"
            lineHeight={1}
            fontSize={18}
            mb={0}
          >
            {author.name}
          </Typography>
          {subtitle && (
            <Typography variant="body1" color="common.white" lineHeight={1.2}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
    </Link>
  )
}

export default AuthorCard
