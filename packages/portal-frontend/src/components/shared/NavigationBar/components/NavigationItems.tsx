'use client'

import React from 'react'

import { Button, Stack } from '@mui/material'

import { type NavigationBarItem } from '../NavigationBar'

export const NavigationItems = ({
  items,
  active,
  onSelect
}: {
  items: NavigationBarItem[]
  active: string | null
  onSelect: (e: React.MouseEvent, id: string) => void
}) => (
  <Stack spacing={2} direction="row" justifyContent="center">
    {items.map(({ id, label }) => (
      <Button
        key={id}
        href={`#${id}`}
        aria-current={active === id || undefined}
        variant={active === id ? 'contained' : 'text'}
        onClick={(e: React.MouseEvent) => onSelect(e, id)}
        sx={{ height: '44px', whiteSpace: 'nowrap' }}
      >
        {label}
      </Button>
    ))}
  </Stack>
)
