import palette from '@configs/theme/palette'
import SvgIcon, { type SvgColorIconProps } from '@icons/SvgIcon'

const IcoUpdate = ({
  color = palette.primary.main,
  size = 24
}: SvgColorIconProps) => {
  return (
    <SvgIcon size={size} viewBox="0 0 24 24" fill="none">
      <path
        stroke={color}
        strokeLinecap="round"
        strokeWidth="1.2"
        d="M11 20a8 8 0 1 1 8-8v2"
      />
      <path
        stroke={color}
        strokeLinecap="round"
        strokeWidth="1.2"
        d="m22 12-3 3-3-3"
      />
    </SvgIcon>
  )
}
export default IcoUpdate
