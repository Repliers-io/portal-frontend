'use client'

import React from 'react'

import { Stack } from '@mui/material'

import { useBuilding } from 'providers/BuildingProvider'

import { BuildingSectionContainer } from '..'

import {
  SectionDefault,
  SectionWithImage,
  SectionWithRelated,
  SectionWithVideos
} from './sections'

export const BuildingSections = () => {
  const { sections } = useBuilding()

  if (!sections?.length) return null

  return (
    <Stack spacing={4}>
      {sections.map((section, index) => {
        if (section.videoIds) {
          return (
            <BuildingSectionContainer key={index} id="videos">
              <SectionWithVideos
                heading={section.heading}
                content={section.content}
                videoIds={section.videoIds}
              />
            </BuildingSectionContainer>
          )
        }

        if (section.related?.length) {
          return (
            <BuildingSectionContainer key={index} id="similar">
              <SectionWithRelated
                heading={section.heading}
                content={section.content}
                relatedData={section.relatedData}
              />
            </BuildingSectionContainer>
          )
        }

        if (section.image) {
          return (
            <BuildingSectionContainer key={index}>
              <SectionWithImage
                heading={section.heading}
                content={section.content}
                image={section.imageData}
              />
            </BuildingSectionContainer>
          )
        }

        return (
          <BuildingSectionContainer key={index}>
            <SectionDefault
              heading={section.heading}
              content={section.content}
            />
          </BuildingSectionContainer>
        )
      })}
    </Stack>
  )
}
