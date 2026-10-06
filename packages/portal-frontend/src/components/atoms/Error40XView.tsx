import React from 'react'
import Image from 'next/image'

import { Box } from '@mui/material'

import Yoda from 'assets/common/yoda.svg'

import { FullscreenView } from '.'

const phrases = {
  401: 'Access, you have not. Authorized, you must be.',
  403: 'Forbidden, your request is. The path, you cannot walk.',
  404: 'Wrong path, you have taken. Turn back, you must.'
} as const

type ErrorCode = keyof typeof phrases

export type Error40XViewProps = {
  errorCode?: ErrorCode
}

/**
 * Error view component WITHOUT PageTemplate wrapper
 * Use this inside components that are already wrapped with PageTemplate/ClientSidePageTemplate
 * For top-level pages, use Page40XTemplate instead
 */
export const Error40XView = ({ errorCode = 404 }: Error40XViewProps) => {
  return (
    <Box sx={{ bgcolor: 'background.paper' }}>
      <FullscreenView title={String(errorCode)} subtitle={phrases[errorCode]}>
        <Box pt={2}>
          <Image src={Yoda} alt="Yoda" width={200} height={200} />
        </Box>
      </FullscreenView>
    </Box>
  )
}
