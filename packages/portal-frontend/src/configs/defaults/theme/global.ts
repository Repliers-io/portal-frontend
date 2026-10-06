import type { CSSObject } from '@mui/system'

const globalStyles: CSSObject = {
  // Chrome flashes its default tap highlight, Android's Holo blue rgba(51, 181, 229, .4), on
  // every plain link; MUI's ButtonBase clears it on its controls and ripples instead
  html: { WebkitTapHighlightColor: 'transparent' },
  // iOS Safari zooms into a focused field set under 16px and never zooms back out;
  // `!important` outranks the per-component `sx` sizes of every field at once
  '@media (pointer: coarse)': {
    'input, textarea, select': { fontSize: '16px !important' }
  }
}

export default globalStyles
