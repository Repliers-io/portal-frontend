import { Box, Stack, Typography } from '@mui/material'

const ChartTooltipItem = ({
  label,
  value,
  color
}: {
  label: string
  value: number | string
  color?: string
}) => {
  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center">
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: color || 'common.black'
          }}
        />
        {label && (
          <Typography fontSize={12} color="text.hint">
            {label}
          </Typography>
        )}
        <Typography fontSize={14} fontWeight={500} color="common.black">
          {value}
        </Typography>
      </Stack>
    </Box>
  )
}
export default ChartTooltipItem
