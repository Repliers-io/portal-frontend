import { lighten } from '@mui/material'

import cardsConfig from '@configs/cards-grids'
import { error, primary, secondary } from '@configs/colors'

export const aiColor = '#FFCB63'
export const aiBgColor = lighten(aiColor, 0.8)
export const aiErrorBgColor = lighten(error, 0.9)
export const clientBgColor = lighten(primary, 0.9)
export const activeBgColor = lighten(secondary, 0.95)

export const minContainerStartWidth = 168
export const minContainerContinueWidth = 168
export const maxContainerWidth = 336

export const maxHistoryHeight = 460

// the chat panel (ChatContent, the size container) is one listing column wide
export const singleColumnQuery = `@container (max-width: ${cardsConfig.gridSideContainerWidth.md}px)`
