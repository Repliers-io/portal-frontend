import { useContext } from 'react'

import {
  SnackbarContext,
  type SnackbarContextActions
} from 'providers/SnackbarProvider'

const useSnackbar = (): SnackbarContextActions => {
  const context = useContext(SnackbarContext)
  if (!context) {
    throw Error('useSnackbar must be used within a SnackbarProvider')
  }
  return context
}

export default useSnackbar
