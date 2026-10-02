'use client'

import React from 'react'

import { Alert, AlertTitle, List, ListItem } from '@mui/material'

interface WidgetValidationErrorsProps {
  widgetName: string
  errors: string[]
}

/**
 * Component for displaying widget validation errors
 * Shows Joi validation errors in a user-friendly format
 */
export const WidgetValidationErrors = ({
  widgetName,
  errors
}: WidgetValidationErrorsProps) => {
  if (errors.length === 0) return null

  return (
    <Alert
      severity="error"
      sx={{
        mb: 1,
        borderRadius: 1,
        border: 2,
        borderColor: 'error.main',
        bgcolor: 'error.light'
      }}
    >
      <AlertTitle sx={{ m: 0, p: 0 }}>
        Widget "{widgetName}" parameters validation failed
      </AlertTitle>
      <List>
        {errors.map((error, index) => (
          <ListItem key={index} sx={{ display: 'list-item', p: 0 }}>
            {error}
          </ListItem>
        ))}
      </List>
    </Alert>
  )
}
