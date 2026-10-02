import Image from 'next/image'
import Link from 'next/link'

import { Box } from '@mui/material'

interface PlatformCardProps {
  name: string
  logo: string
  href: string
}

const PlatformCard = ({ name, logo, href }: PlatformCardProps) => {
  return (
    <Link href={href} target="_blank" rel="noopener noreferrer">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          boxSizing: 'border-box',
          height: { xs: 160, md: 200 },
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          background: 'rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(60px)',
          transition: 'background 0.3s ease',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.5)'
          }
        }}
      >
        <Image
          src={logo}
          alt={name}
          // next/image requires setting either width/height
          width={0}
          height={0}
          // responsive sizing and use images with own size
          style={{ width: 'auto', height: 'auto', maxWidth: '100%' }}
        />
      </Box>
    </Link>
  )
}

export default PlatformCard
