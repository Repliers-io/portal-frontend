import { createTheme, type Shadows } from '@mui/material/styles'

const emptyTheme = createTheme()

const values = [
  'none',
  '0px 1px 14px #0001',
  '0px 1px 14px #0002',
  '0px 2px 14px #0004'
]

const shadows = emptyTheme.shadows.map(
  (el, index) => values[index] || el
) as Shadows

export default shadows
