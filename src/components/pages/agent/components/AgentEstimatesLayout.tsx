import type React from 'react'

import { Container, Grid2 as Grid, Stack } from '@mui/material'

interface AgentEstimatesLayoutProps {
  topSlot: React.ReactNode
  leftSlot: React.ReactNode
  rightSlot: React.ReactNode
}

const AgentEstimatesLayout: React.FC<AgentEstimatesLayoutProps> = ({
  topSlot,
  leftSlot,
  rightSlot
}) => {
  return (
    <Container>
      <Stack spacing={{ xs: 2, md: 4 }} py={{ xs: 2, md: 4 }}>
        {/* Breadcrumbs */}
        {topSlot && <Grid size={12}>{topSlot}</Grid>}

        <Grid container spacing={{ xs: 2, md: 4 }}>
          {/* Profile */}
          <Grid size={{ xs: 12, md: 4 }}>{leftSlot}</Grid>
          {/* Estimate cards */}
          <Grid container size={{ xs: 12, md: 8 }}>
            <Stack spacing={{ xs: 2, md: 4 }} width="100%">
              {rightSlot}
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  )
}

export default AgentEstimatesLayout
