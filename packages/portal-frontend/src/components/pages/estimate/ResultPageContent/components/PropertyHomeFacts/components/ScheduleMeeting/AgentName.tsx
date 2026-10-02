import React from 'react'

import { Typography } from '@mui/material'

type AgentNameProps = {
  children: React.ReactNode
}

export const AgentName = ({ children }: AgentNameProps) => (
  <Typography variant="h4">{children}</Typography>
)
