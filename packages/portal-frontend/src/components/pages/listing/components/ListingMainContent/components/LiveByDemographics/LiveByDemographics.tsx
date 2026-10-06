'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Button, Collapse, Stack, Typography } from '@mui/material'

import { DetailsContainer } from '@shared/Containers/DetailsContainer'

import type { LiveByDemographicsLocation } from 'services/API/types'
import { useLiveByDemographics } from 'providers/LiveByDemographicsProvider'

import { buildDemographicsSections } from './buildDemographicsSections'
import { SectionBlock } from './components'

const LiveByDemographicsContent = ({
  location,
  visibleCount,
  showLess = true
}: {
  location: LiveByDemographicsLocation
  visibleCount: number | false
  showLess?: boolean
}) => {
  const t = useTranslations('liveByDemographics')
  const [expanded, setExpanded] = useState(false)

  const sections = useMemo(
    () =>
      location.demographics
        ? buildDemographicsSections(location.demographics)
        : [],
    [location]
  )

  if (!sections.length) return null

  const visible =
    visibleCount !== false ? sections.slice(0, visibleCount) : sections
  const hidden = visibleCount !== false ? sections.slice(visibleCount) : []

  const subtitle = (
    <>
      <Typography variant="caption" color="text.secondary" display="block">
        Powered by <b>LiveBy</b>
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block">
        {t('attribution', {
          attribution: location.demographics?.metadata.attribution || ''
        })}
      </Typography>
    </>
  )

  return (
    <DetailsContainer
      id="liveByDemographics"
      title={t('title', { name: location.name || '' })}
      subtitle={subtitle}
    >
      <Stack spacing={4}>
        {visible.map((section, i) => (
          <SectionBlock
            key={section.id}
            section={section}
            divider={i > 0}
            hideZero
          />
        ))}

        {visibleCount !== false && hidden.length > 0 && (
          <>
            <Collapse in={expanded} unmountOnExit>
              <Stack spacing={4}>
                {hidden.map((section) => (
                  <SectionBlock
                    key={section.id}
                    section={section}
                    divider
                    hideZero
                  />
                ))}
              </Stack>
            </Collapse>

            {(!expanded || showLess) && (
              <Button
                variant="outlined"
                onClick={() => setExpanded((prev) => !prev)}
                sx={{ alignSelf: 'center' }}
              >
                {expanded ? t('showLess') : t('showMore')}
              </Button>
            )}
          </>
        )}
      </Stack>
    </DetailsContainer>
  )
}

export const LiveByDemographics = ({
  visibleCount = false,
  showLess = false
}: {
  visibleCount?: number | false
  showLess?: boolean
}) => {
  const location = useLiveByDemographics()
  if (!location) return null

  return (
    <LiveByDemographicsContent
      location={location}
      visibleCount={visibleCount}
      showLess={showLess}
    />
  )
}
