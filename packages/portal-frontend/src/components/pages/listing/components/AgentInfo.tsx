import React from 'react'
import { useTranslations } from 'next-intl'

import { Stack, Typography } from '@mui/material'

import { ScrubbedText } from 'components/atoms'

import { useListing } from 'providers/ListingProvider'
import { sold } from 'utils/listings'
import { joinNonEmpty } from 'utils/strings'

export const AgentInfo = () => {
  const { listing } = useListing()
  const t = useTranslations()
  const {
    agents,
    raw,
    office: { brokerageName }
  } = listing

  const boughtWith = sold(listing)
    ? joinNonEmpty([
        raw?.BuyerAgentFullName || raw?.BuyerAgentAOR,
        raw?.BuyerOfficeName
      ])
    : null

  const renderWithNoWrap = (text: string) => {
    return text.split(', ').map((part, i, arr) => (
      <React.Fragment key={i}>
        <span style={{ whiteSpace: 'nowrap' }}>{part}</span>
        {i < arr.length - 1 && ', '}
      </React.Fragment>
    ))
  }

  return (
    <Stack spacing={{ xs: 0.5, md: 4 }} direction={{ xs: 'column', md: 'row' }}>
      {(agents?.length || brokerageName) && (
        <Stack spacing={2} direction="row" sx={{ flexGrow: 1 }}>
          <Typography color="text.hint" noWrap sx={{ flexShrink: 0 }}>
            {t('PDP.listedByLabel')}:
          </Typography>
          {agents?.length ? (
            <Stack spacing={0.5} flexWrap="wrap" direction="column">
              {agents.map((agent) => (
                <Typography color="text.hint" key={agent.agentId} pr={1.5}>
                  <ScrubbedText replace="Brokerage Name">
                    {renderWithNoWrap(
                      joinNonEmpty([agent.name, agent.brokerage.name])
                    )}
                  </ScrubbedText>
                </Typography>
              ))}
            </Stack>
          ) : (
            <Typography color="text.hint">
              <ScrubbedText replace="Brokerage Name">
                {brokerageName}
              </ScrubbedText>
            </Typography>
          )}
        </Stack>
      )}
      {boughtWith && (
        <Stack spacing={2} direction="row" sx={{ flexGrow: 1 }}>
          <Typography color="text.hint" noWrap sx={{ flexShrink: 0 }}>
            {t('PDP.boughtWithLabel')}:
          </Typography>
          <Typography color="text.hint">
            <ScrubbedText replace="Brokerage Name">
              {renderWithNoWrap(boughtWith)}
            </ScrubbedText>
          </Typography>
        </Stack>
      )}
    </Stack>
  )
}
