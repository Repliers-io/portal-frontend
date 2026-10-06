import React from 'react'

import { ToggleButton, ToggleButtonGroup } from '@mui/material'

import { HomeRoundedIcon, VideocamRoundedIcon } from '@configs/icons'

import { type ContactScheduleMethod } from 'services/API'

interface TourMethodSelectorProps {
  value: ContactScheduleMethod
  onChange: (value: ContactScheduleMethod) => void
}

export const TourMethodSelector = ({
  value,
  onChange
}: TourMethodSelectorProps) => {
  return (
    <ToggleButtonGroup
      fullWidth
      exclusive
      size="small"
      value={value}
      onChange={(_, newMethod) => {
        if (newMethod !== null) onChange(newMethod)
      }}
    >
      <ToggleButton value="InPerson" sx={{ fontSize: 12, px: 0 }}>
        <HomeRoundedIcon fontSize="small" sx={{ mr: 0.5 }} />
        In person
      </ToggleButton>
      <ToggleButton value="LiveVideo" sx={{ fontSize: 12, px: 0 }}>
        <VideocamRoundedIcon fontSize="small" sx={{ mr: 0.5 }} />
        Live video
      </ToggleButton>
    </ToggleButtonGroup>
  )
}
