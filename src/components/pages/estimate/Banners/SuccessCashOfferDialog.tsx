import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from '@mui/material'

const SuccessCashOfferDialog = ({
  open,
  onClose
}: {
  open: boolean
  onClose: () => void
}) => {
  return (
    <Dialog
      open={open}
      sx={{
        '.MuiPaper-root': { width: '100%', maxWidth: 520 },
        '& .MuiDialogTitle-root': { px: { xs: 3, sm: 8 } },
        '& .MuiDialogActions-root': { bgcolor: 'transparent' }
      }}
    >
      <DialogTitle>
        Thank you for your interest in the Cash Offer for your home
      </DialogTitle>
      <DialogContent>
        <Typography textAlign="center">
          We&#39;ll be in touch shortly to provide you more information.
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

export default SuccessCashOfferDialog
