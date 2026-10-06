import { Button, DialogActions, Stack } from '@mui/material'

import { useUser } from 'providers/UserProvider'

type FormSubmitBarProps = {
  embedded?: boolean
  onSave: () => void
  onCancel?: () => void
}

export const FormSubmitBar = ({
  embedded = false,
  onSave,
  onCancel
}: FormSubmitBarProps) => {
  const { loading } = useUser()

  return (
    <DialogActions>
      <Stack direction="row" spacing={2} alignItems="center">
        <Button
          size="large"
          color="primary"
          variant="contained"
          loading={loading}
          onClick={onSave}
          sx={{ flex: 1, minWidth: embedded ? 192 : 124 }}
        >
          Save
        </Button>
        {!embedded && (
          <Button
            size="large"
            variant="outlined"
            onClick={onCancel}
            disabled={loading}
            sx={{ flex: 1, minWidth: 124 }}
          >
            Cancel
          </Button>
        )}
      </Stack>
    </DialogActions>
  )
}
