'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'

import { Box, Button, Container, Typography } from '@mui/material'

import layoutConfig from '@configs/layout'

import { useDialog } from 'providers/DialogProvider'

import styles from './FadeIn.module.css'

const { headerHeight } = layoutConfig

export const contentHeight = {
  xs: `calc(100vh - ${headerHeight.xs}px)`,
  sm: `calc(100vh - ${headerHeight.sm}px)`
}

export const AuthView = () => {
  const { showDialogInstantly, showDialog } = useDialog('auth')
  const t = useTranslations('Templates')

  useEffect(() => {
    // show it without animation on first render
    showDialogInstantly()
  }, [])

  return (
    <Container maxWidth="lg">
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        className={styles.fadeIn}
        sx={{
          height: contentHeight
        }}
      >
        <Typography component="div">
          {t.rich('needSignIn', {
            link: (chunks) => (
              <Button
                variant="text"
                sx={{ mx: 1, fontWeight: 600 }}
                onClick={showDialog}
              >
                {chunks}
              </Button>
            )
          })}
        </Typography>
      </Box>
    </Container>
  )
}
