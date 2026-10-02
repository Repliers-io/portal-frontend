import {
  SvgIcon as MuiSvgIcon,
  type SvgIconProps as MuiSvgIconProps
} from '@mui/material'

// Custom icons are built on MUI's SvgIcon so they share one prop contract with
// @mui/icons-material and are interchangeable in the icon registry. `size` (px)
// and `color` (raw string/hex/token) are kept as back-compat conveniences and
// mapped onto sx, so existing call sites keep working unchanged.
export type SvgIconProps = Omit<MuiSvgIconProps, 'color'> & {
  size?: number
  color?: string
}

export type SvgColorIconProps = SvgIconProps

const SvgIcon = ({ size = 20, color, fill, sx, ...rest }: SvgIconProps) => {
  return (
    <MuiSvgIcon
      sx={{
        fontSize: size,
        ...(fill && { fill }),
        ...(color && { color }),
        ...sx
      }}
      {...rest}
    />
  )
}

export default SvgIcon
