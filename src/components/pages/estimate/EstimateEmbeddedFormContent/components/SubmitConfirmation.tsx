import RefreshIcon from '@mui/icons-material/Refresh'
import { Button, Stack, Typography } from '@mui/material'

const SubmitConfirmation = ({ onReset }: { onReset?: () => void }) => {
  // NOTE: reset button is only shown when the form is embedded in an iframe
  // it doesnt make sense to show it when the form is opened in a new window,
  // which will be closed in a second
  const showReset = window.self !== window.top

  return (
    <Stack
      spacing={4}
      alignItems="center"
      justifyContent="center"
      sx={{
        width: '100%',
        height: '100vh',
        display: 'flex'
      }}
    >
      <Typography variant="h2" textAlign="center" px={4}>
        We’ve opened your home estimate in a separate tab for your convenience
      </Typography>

      {showReset && (
        <Button
          color="primary"
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={onReset}
        >
          Start over
        </Button>
      )}
    </Stack>
  )
}

export default SubmitConfirmation
