import palette from '@configs/theme/palette'
import SvgIcon, { type SvgColorIconProps } from '@icons/SvgIcon'

const IcoImport = ({
  color = palette.primary.main,
  size = 24
}: SvgColorIconProps) => {
  return (
    <SvgIcon size={size} viewBox="0 0 24 24" fill="none">
      <path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.2"
        d="M18 16v2.667A1.334 1.334 0 0 1 16.667 20H7.333A1.334 1.334 0 0 1 6 18.667V16M7 10l5 5 5-5M12 15V3"
      />
    </SvgIcon>
  )
}
export default IcoImport
