import { lighten } from '@mui/material'

import { secondary } from '@configs/colors'

export const aiColor = '#FFCB63'
export const aiBgColor = lighten(aiColor, 0.8)
export const clientBgColor = '#F4F4F4'
export const activeBgColor = lighten(secondary, 0.95)

export const minContainerStartWidth = 160
export const minContainerContinueWidth = 212
export const maxContainerWidth = 316

export const maxHistoryHeight = 400

export const placeholderOpenValue = 'Extend and clarify your criteria...'
export const placeholderContinueValue = 'Continue chat...'
export const placeholderStartValue = 'Start chat...'
