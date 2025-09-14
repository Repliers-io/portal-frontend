import Grid from '@mui/material/Grid2' // Grid version 2

import useBreakpoints from 'hooks/useBreakpoints'

import { GridContainer, GridSection, GridTitle } from './components'
import { AddressSection } from './sections'

const Step0AgentAddress = () => {
  const { desktop } = useBreakpoints()
  return (
    <GridContainer>
      <GridSection>
        {desktop && <GridTitle>Home Location</GridTitle>}
        <Grid size={12}>
          <AddressSection agentRole />
        </Grid>
      </GridSection>
    </GridContainer>
  )
}

export default Step0AgentAddress
