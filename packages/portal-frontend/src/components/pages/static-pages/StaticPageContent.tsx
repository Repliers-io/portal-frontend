'use client'

import React from 'react'

import { CmsContentRenderer } from '@shared/CmsContentRenderer'

import { type Page } from 'services/CMS'

type StaticPageContentProps = {
  page: Page
  path?: string[]
  sidebar?: React.ReactNode
}

export const StaticPageContent = ({
  page,
  path: _,
  sidebar: __
}: StaticPageContentProps) => {
  return (
    <CmsContentRenderer
      content={page.contentRaw ?? page.content}
      format={page.contentRaw ? 'raw' : undefined}
    />
  )
}
