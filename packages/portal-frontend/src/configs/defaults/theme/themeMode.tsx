'use client'

import { type ReactNode } from 'react'

// Fallback: pass children through (see movesmartly-com for real implementation)
export const DarkMode = ({ children }: { children: ReactNode }) => (
  <>{children}</>
)
export const LightMode = ({ children }: { children: ReactNode }) => (
  <>{children}</>
)
