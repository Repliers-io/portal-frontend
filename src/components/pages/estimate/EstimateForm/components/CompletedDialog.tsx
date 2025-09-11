import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from '@mui/material'

import useBreakpoints from 'hooks/useBreakpoints'

const CompletedDialog = ({
  open,
  onClose
}: {
  open: boolean
  onClose: () => void
}) => {
  const { mobile } = useBreakpoints()
  if (mobile) return null

  return (
    <Dialog
      open={open}
      sx={{
        '.MuiPaper-root': { width: '100%', maxWidth: 520 }
      }}
    >
      <DialogTitle>Your home details have been submitted!</DialogTitle>
      <DialogContent>
        <Typography textAlign="center">
          Sit tight! Our AI is working hard to generate the most accurate
          estimate of your home&apos;s value.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" sx={{ minWidth: 160 }} onClick={onClose}>
          Got it
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CompletedDialog
