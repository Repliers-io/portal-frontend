import { Box } from '@mui/material'

const HistoryItemProgressBar = ({
  last,
  active
}: {
  last: boolean
  active: boolean
}) => {
  return (
    <Box
      sx={{
        display: { xs: 'none', md: 'flex' },
        justifyContent: 'center',
        position: 'relative'
      }}
    >
      <Box
        sx={{
          mt: '6px',
          width: '13px',
          height: '13px',
          borderRadius: 4,
          bgcolor: active ? 'secondary.main' : 'primary.main'
        }}
      />
      {!last && (
        <Box
          sx={{
            position: 'absolute',
            top: '19px',
            left: '6px',
            width: '1px',
            height: 'calc(100% + 16px)',
            bgcolor: 'divider'
          }}
        />
      )}
    </Box>
  )
}

export default HistoryItemProgressBar
