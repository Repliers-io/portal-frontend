import { primary as defaultColor } from '@configs/colors'
import SvgIcon, { type SvgColorIconProps } from '@icons/SvgIcon'

const IcoSettings = ({ color = defaultColor, size }: SvgColorIconProps) => {
  return (
    <SvgIcon size={size} viewBox="0 0 20 20">
      <path
        d="M16.6665 5.8335H9.1665"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.6665 14.1667H4.1665"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.1665 16.6665C15.5472 16.6665 16.6665 15.5472 16.6665 14.1665C16.6665 12.7858 15.5472 11.6665 14.1665 11.6665C12.7858 11.6665 11.6665 12.7858 11.6665 14.1665C11.6665 15.5472 12.7858 16.6665 14.1665 16.6665Z"
        fill="transparent"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.8335 8.3335C7.21421 8.3335 8.3335 7.21421 8.3335 5.8335C8.3335 4.45278 7.21421 3.3335 5.8335 3.3335C4.45278 3.3335 3.3335 4.45278 3.3335 5.8335C3.3335 7.21421 4.45278 8.3335 5.8335 8.3335Z"
        fill="transparent"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  )
}

export default IcoSettings
