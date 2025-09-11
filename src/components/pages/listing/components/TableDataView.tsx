import React from 'react'

import { Box, Stack, Typography } from '@mui/material'

import ScrubbedText from 'components/atoms/ScrubbedText'

interface TableDataViewProps {
  data: { item: string | React.ReactNode; value: string | React.ReactNode }[]
}

const TableDataView = ({ data: items }: TableDataViewProps) => {
  return (
    <Box>
      {items.map(({ item, value }) => {
        if (!value || !item) {
          return null
        }

        return (
          <Stack
            width="100%"
            direction="row"
            spacing={2}
            sx={{ py: 1 }}
            key={`${item?.toString()} ${value?.toString()}`}
          >
            <Typography variant="body2" component="div" sx={{ width: '50%' }}>
              {item}
            </Typography>
            <Typography
              variant="body2"
              component="div"
              fontWeight={600}
              color="text.secondary"
              sx={{ width: '50%' }}
            >
              <ScrubbedText replace="000000">{value}</ScrubbedText>
            </Typography>
          </Stack>
        )
      })}
    </Box>
  )
}

export default TableDataView
