'use client'

import React, {
  createContext,
  type ReactNode,
  useCallback,
  useMemo,
  useState
} from 'react'

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import { type AlertProps } from '@mui/material/Alert'

import { SnackbarAlert } from 'components/atoms'

type CustomSnackbarTypes = 'info' | 'success' | 'warning' | 'error'

export type SnackbarContextActions = {
  showSnackbar: (
    text: string | ReactNode,
    type: CustomSnackbarTypes,
    duration?: number
  ) => void
}

const customTypeOptions: Record<
  CustomSnackbarTypes,
  { severity: AlertProps['severity']; icon: ReactNode }
> = {
  info: {
    icon: <InfoOutlinedIcon />,
    severity: 'info'
  },
  success: {
    icon: <CheckCircleOutlineIcon />,
    severity: 'success'
  },
  warning: {
    icon: <WarningAmberOutlinedIcon />,
    severity: 'warning'
  },
  error: {
    icon: <ErrorOutlineIcon />,
    severity: 'error'
  }
}

export const SnackbarContext = createContext<
  SnackbarContextActions | undefined
>(undefined)

interface SnackbarContextProviderProps {
  children: ReactNode
}

const SnackbarProvider: React.FC<SnackbarContextProviderProps> = ({
  children
}) => {
  const [open, setOpen] = useState<boolean>(false)
  const [message, setMessage] = useState<string | ReactNode>('')
  const [type, setType] = useState<CustomSnackbarTypes>('info')
  const [duration, setDuration] = useState<number>(3000)

  const showSnackbar = useCallback(
    (
      text: string | ReactNode,
      type: CustomSnackbarTypes,
      duration: number = 3000
    ) => {
      setType(type)
      setMessage(text)
      setDuration(duration)
      setOpen(true)
    },
    []
  )

  const contextValue = useMemo(() => ({ showSnackbar }), [showSnackbar])

  return (
    <SnackbarContext.Provider value={contextValue}>
      <SnackbarAlert
        open={open}
        message={message}
        duration={duration}
        icon={customTypeOptions[type].icon}
        severity={customTypeOptions[type].severity}
        onClose={() => setOpen(false)}
      />
      {children}
    </SnackbarContext.Provider>
  )
}

export default SnackbarProvider
