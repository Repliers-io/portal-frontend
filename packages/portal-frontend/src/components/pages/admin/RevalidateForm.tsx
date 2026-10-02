'use client'

import React, { useState } from 'react'

import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  Stack,
  TextField,
  Typography
} from '@mui/material'

type Status = { ok: boolean; message: string } | null

export const RevalidateForm = () => {
  const [url, setUrl] = useState('')
  const [token, setToken] = useState('')
  const [forward, setForward] = useState(false)
  const [status, setStatus] = useState<Status>(null)
  const [loading, setLoading] = useState(false)

  const previewPath = (() => {
    if (!url) return null
    try {
      return new URL(url).pathname || '/'
    } catch {
      return url.startsWith('/') ? url : '/' + url
    }
  })()

  const apiEndpoint = (() => {
    if (!url) return null
    try {
      return new URL('/api/revalidate', new URL(url).origin).toString()
    } catch {
      return `${window.location.origin}/api/revalidate`
    }
  })()

  const submit = async () => {
    if (!apiEndpoint || !previewPath) return
    setLoading(true)
    setStatus(null)
    try {
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: previewPath, token })
      })
      if (res.ok) {
        const data = await res.json()
        const paths: string[] = data.revalidatedPaths ?? [data.path]
        setStatus({ ok: true, message: `Revalidated:\n${paths.join('\n')}` })
        if (forward) window.open(url, '_blank')
      } else {
        const data = await res.json().catch(() => ({ error: res.statusText }))
        setStatus({ ok: false, message: `${res.status} — ${data.error}` })
      }
    } catch (e) {
      setStatus({ ok: false, message: String(e) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h2" gutterBottom>
        Revalidate Page
      </Typography>
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <TextField
          label="Page URL"
          placeholder={`${process.env.NEXT_PUBLIC_APP_DOMAIN}/buildings/king-west`}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          fullWidth
          autoFocus
          slotProps={{ htmlInput: { autoComplete: 'off' } }}
        />

        <TextField
          label="Token"
          type="password"
          placeholder="REVALIDATE_TOKEN"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          fullWidth
          slotProps={{ htmlInput: { autoComplete: 'new-password' } }}
        />

        <Stack spacing={2} direction="row" justifyContent="space-between">
          <FormControlLabel
            control={
              <Checkbox
                checked={forward}
                onChange={(e) => setForward(e.target.checked)}
                size="small"
                sx={{ ml: 1 }}
              />
            }
            label="Open page after revalidation"
          />

          <Button
            type="submit"
            variant="contained"
            disabled={!apiEndpoint || !previewPath || loading}
            startIcon={
              loading ? <CircularProgress size={16} color="inherit" /> : null
            }
          >
            Revalidate
          </Button>
        </Stack>

        {status && (
          <Alert severity={status.ok ? 'success' : 'error'}>
            {status.message}
          </Alert>
        )}
      </Box>
    </Container>
  )
}
