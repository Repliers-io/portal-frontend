'use client'

import {
  Box,
  CircularProgress,
  IconButton,
  Stack,
  Typography
} from '@mui/material'

import { CloseIcon } from '@configs/icons'

import { AgentAvatar } from '.'

interface AgentHeaderProps {
  onClose: () => void
  loading?: boolean
}

export const AgentHeader = ({ onClose, loading = false }: AgentHeaderProps) => {
  return (
    <Box
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'primary.main',
        color: 'common.white'
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} width="100%">
        {loading ? (
          <Box
            sx={{
              width: 28,
              height: 28,
              alignItems: 'center',
              justifyContent: ' center',
              display: 'flex',
              ml: 0.5
            }}
          >
            <CircularProgress size={22} sx={{ color: 'white' }} />
          </Box>
        ) : (
          <AgentAvatar size={28} sx={{ ml: 0.5 }} />
        )}
        <Typography variant="h4" color="inherit" flex={1} textAlign="center">
          AI Agent
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon sx={{ color: 'white' }} />
        </IconButton>
      </Stack>
    </Box>
  )
}
