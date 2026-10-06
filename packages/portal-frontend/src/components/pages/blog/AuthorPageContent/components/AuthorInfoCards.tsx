'use client'

import { useTranslations } from 'next-intl'

import { Button, Grid } from '@mui/material'

import { InfoItemText } from '@pages/building/components/BuildingInfo/components'

import { useDialog } from 'providers/DialogProvider'

type AuthorInfoCardsProps = {
  homesClosed?: string
  emailPublic?: string
  phone?: string
  firstName?: string
}

export const AuthorInfoCards = ({
  homesClosed,
  emailPublic,
  phone,
  firstName
}: AuthorInfoCardsProps) => {
  const { showDialog } = useDialog('contact')
  const t = useTranslations()

  if (!homesClosed && !emailPublic && !phone) return null

  return (
    <Grid
      container
      spacing={{ xs: 2, md: 4 }}
      sx={{ mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}
    >
      {emailPublic && (
        <Grid size={{ xs: 12, sm: 6 }}>
          <InfoItemText
            label={t('Forms.emailLabel')}
            value={<a href={`mailto:${emailPublic}`}>{emailPublic}</a>}
          />
        </Grid>
      )}
      {phone && (
        <Grid size={{ xs: 12, sm: 6 }}>
          <InfoItemText
            label={t('Forms.phoneLabel')}
            value={<a href={`tel:${phone}`}>{phone}</a>}
          />
        </Grid>
      )}
      {homesClosed && (
        <Grid size={{ xs: 12, sm: 6 }}>
          <InfoItemText label={t('Blog.homesClosed')} value={homesClosed} />
        </Grid>
      )}
      <Grid
        size={{ xs: 12, sm: 6 }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Button
          size="large"
          color="primary"
          variant="contained"
          onClick={showDialog}
        >
          {t('Blog.contactMe', { name: firstName ?? '' })}
        </Button>
      </Grid>
    </Grid>
  )
}
