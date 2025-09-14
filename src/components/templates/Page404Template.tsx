'use client'

import React from 'react'
import Image from 'next/image'

import { Box } from '@mui/material'

import Yoda from 'assets/common/yoda.svg'

import { FullscreenView } from 'components/atoms'

import { PageTemplate } from '.'

const phrases = {
  401: 'Access, you have not. Authorized, you must be.',
  403: 'Forbidden, your request is. The path, you cannot walk.',
  404: 'Wrong path, you have taken. Turn back, you must.'
} as const

type ErrorCode = keyof typeof phrases

const Page40XTemplate = ({ errorCode = 404 }: { errorCode?: ErrorCode }) => {
  return (
    <PageTemplate>
      <FullscreenView title={String(errorCode)} subtitle={phrases[errorCode]}>
        <Box pt={2}>
          <Image src={Yoda} alt="Yoda" width={200} height={200} />
        </Box>
      </FullscreenView>
    </PageTemplate>
  )
}

export default Page40XTemplate
