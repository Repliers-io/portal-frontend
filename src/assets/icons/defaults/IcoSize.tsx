import SvgIcon, { type SvgColorIconProps } from '@icons/SvgIcon'

const IcoSize = ({ color = '#fff', size = 40 }: SvgColorIconProps) => {
  return (
    <SvgIcon size={size} viewBox="0 0 40 40" fill="transparent">
      <g clipPath="url(#clip0_296_2201)">
        <circle cx="20" cy="20" r="19.4" stroke={color} strokeWidth="1.2" />
        <path
          d="M13 17L10 20L13 23"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M17 13L20 10L23 13"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M23 27L20 30L17 27"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M27 17L30 20L27 23"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 20H30"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20 10V30"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_296_2201">
          <rect width="40" height="40" fill={color} />
        </clipPath>
      </defs>
    </SvgIcon>
  )
}
export default IcoSize
