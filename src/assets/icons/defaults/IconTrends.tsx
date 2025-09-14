import SvgIcon, { type SvgColorIconProps } from '@icons/SvgIcon'

const IconTrends = ({ color = '#fff', size = 40 }: SvgColorIconProps) => {
  return (
    <SvgIcon size={size} viewBox="0 0 40 40" fill="transparent">
      <g clipPath="url(#clip0_296_2222)">
        <circle cx="20" cy="20" r="19.4" stroke={color} strokeWidth="1.2" />
        <path
          d="M9 27L16.3333 19.2L21.2222 24.4L31 14"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M31 18V14H27"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_296_2222">
          <rect width="40" height="40" fill={color} />
        </clipPath>
      </defs>
    </SvgIcon>
  )
}
export default IconTrends
