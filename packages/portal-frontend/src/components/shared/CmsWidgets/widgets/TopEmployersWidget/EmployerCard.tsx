import Image from 'next/image'

import { Box } from '@mui/material'

interface EmployerCardProps {
  name: string
  logo: string
}

const EmployerCard = ({ name, logo }: EmployerCardProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        boxSizing: 'border-box',
        height: 120,
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        background: 'rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(60px)'
      }}
    >
      <Image
        src={logo}
        alt={name}
        width={0}
        height={0}
        style={{ width: 'auto', height: 'auto', maxWidth: '100%' }}
      />
    </Box>
  )
}

export default EmployerCard
