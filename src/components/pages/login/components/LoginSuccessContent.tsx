import TaskAltIcon from '@mui/icons-material/TaskAlt'
import { DialogContent, Stack, Typography } from '@mui/material'

const LoginSuccessContent = () => {
  return (
    <DialogContent
      sx={{ px: { sm: 8 }, py: 8, minHeight: 'auto', flexGrow: 0 }}
    >
      <Stack spacing={2} justifyContent="center" alignItems="center">
        <TaskAltIcon sx={{ fontSize: 96, color: 'primary.main' }} />
        <Typography variant="h4" textAlign="center">
          You are successfully signed in!
        </Typography>
      </Stack>
    </DialogContent>
  )
}

export default LoginSuccessContent
