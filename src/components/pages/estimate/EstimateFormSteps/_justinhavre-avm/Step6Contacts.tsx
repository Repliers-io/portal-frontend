import React from 'react'

import Grid from '@mui/material/Grid2' // Grid version 2

import { Asterisk } from 'components/atoms'

import { EstimateCheckbox, GridContainer, GridSection } from '../components'
import { useFormField } from '../hooks'
import { ContactsSection } from '../sections'

const ContactsStep = () => {
  return (
    <GridContainer
      sx={{
        '& > .MuiGrid2-root': {
          borderBottom: 0,
          mb: 0
        }
      }}
    >
      <ContactsSection />
      <GridSection>
        <Grid size={{ xs: 12, sm: 12 }}>
          <EstimateCheckbox
            label={
              <>
                I acknowledge and authorize justinhavre.com and Justin Havre of
                eXp Realty to refer me to a suitable agent(s) in a home
                purchase, sale and/or mortgage approval. In such case, I also
                acknowledge and authorize that the referred agent(s) may pay a
                referral fee. (This does not constitute a formal buyers
                brokerage agreement nor compel me to use the referred agent(s)).
                My information will not be disclosed to any party in any way not
                associated with the Privacy Policy. <Asterisk />
              </>
            }
            {...useFormField('termsAgreement')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 12 }}>
          <EstimateCheckbox
            label="I agree to receive electronic messages from the Justin Havre Real Estate Team including a monthly Property Estimate. I can unsubscribe at any time."
            {...useFormField('sendEmailNow')}
          />
        </Grid>
      </GridSection>
    </GridContainer>
  )
}

export default ContactsStep
