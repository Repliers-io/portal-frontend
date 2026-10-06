import type { SxProps } from '@mui/material'

// Configuration for Agent widget
export interface AgentConfig {
  iframeUrl: string
  buttonSx?: SxProps
  chatSx?: SxProps
  sessionId?: string
}

const iframeUrl = process.env.NEXT_PUBLIC_AI_AGENT_IFRAME_URL || ''

const config: AgentConfig = {
  iframeUrl,
  buttonSx: {
    right: 16,
    bottom: 16,
    position: 'fixed'
  },
  chatSx: {
    width: 342,
    height: 520,
    position: 'fixed',
    bottom: 'max(0px, calc((100vh - 144px - 520px) / 2))',
    right: {
      md: 0,
      lg: 155 // (652 / 2) - (342 / 2)
    }
  }
}

export default config
