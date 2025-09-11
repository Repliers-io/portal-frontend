import SvgIcon, { type SvgColorIconProps } from '@icons/SvgIcon'

const IcoCube = ({ color = '#fff', size = 40 }: SvgColorIconProps) => {
  return (
    <SvgIcon size={size} viewBox="0 0 40 40" fill="transparent">
      <g stroke={color} strokeWidth="1.2" clipPath="url(#a)">
        <circle cx="20" cy="20" r="19.4" stroke={color} strokeWidth="1.2" />
        <path
          strokeLinejoin="round"
          d="m20 10 9 5v10l-9 5-9-5V15l9-5Z"
          clipRule="evenodd"
        />
        <path d="m11 15 9 5 9-5M20 20v10" />
      </g>
    </SvgIcon>
  )
}
export default IcoCube
