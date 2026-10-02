import { Slider, type SliderProps } from '@mui/material'

// The rail, range and thumbs only — where the slider sits and how its value labels
// are laid out is the picker's, and arrives in `sx`.
export const PriceSlider = ({ sx, ...props }: SliderProps) => (
  <Slider
    {...props}
    sx={[
      {
        '& .MuiSlider-rail': {
          opacity: 1,
          height: '2px',
          color: 'divider'
        },
        '& .MuiSlider-track': {
          height: '2px',
          border: 'none',
          bgcolor: 'primary.main',
          transition: 'none'
        },
        '& .MuiSlider-thumb': {
          bgcolor: 'primary.main',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: '50% 50%',
          transition: 'none'
        }
      },
      ...(Array.isArray(sx) ? sx : [sx])
    ]}
  />
)
