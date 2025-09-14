import type React from 'react'

import { Stack, Typography } from '@mui/material'

import { toRem } from 'utils/theme'

export type CalculationItemProps = {
  icon: React.ReactNode
  prefix?: React.ReactNode
  value: string
  label: string
}

const CalculationItem: React.FC<CalculationItemProps> = ({
  icon,
  prefix,
  value,
  label
}) => {
  return (
    <Stack
      direction={{
        xs: 'column',
        sm: 'row'
      }}
      spacing={1.5}
      sx={{ minWidth: prefix ? '25%' : 'calc(25% - 26px)' }}
    >
      {/* Column prefix */}
      {prefix && (
        <Stack
          pt={{
            xs: 0,
            sm: 7.5
          }}
          pl={{
            xs: '14px',
            sm: 0
          }}
        >
          <Stack
            fontSize={24}
            fontWeight={100}
            color="common.white"
            lineHeight={toRem(24)}
          >
            {prefix}
          </Stack>
        </Stack>
      )}

      {/* Column content */}
      <Stack
        direction={{
          xs: 'row',
          sm: 'column'
        }}
        spacing={2.5}
        pb={{ xs: 1, sm: 0 }}
      >
        {icon}
        <Stack direction="column" spacing={0.5}>
          <Typography
            component="h4"
            color="common.white"
            sx={{
              fontSize: toRem(20),
              fontWeight: 'bold',
              lineHeight: 1.2
            }}
          >
            {value}
          </Typography>

          <Typography
            variant="caption"
            color="divider"
            sx={{
              fontSize: toRem(12),
              fontWeight: 400,
              lineHeight: 1.4,
              maxWidth: { xs: 'auto', sm: 76 }
            }}
          >
            {label}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  )
}

export default CalculationItem
