import SvgIcon, { type SvgColorIconProps } from '@icons/SvgIcon'

const IcoCalendar = ({ color = '#fff', size = 40 }: SvgColorIconProps) => {
  return (
    <SvgIcon size={size} viewBox="0 0 40 40" fill="transparent">
      <g clipPath="url(#clip0_296_2208)">
        <circle cx="20" cy="20" r="19.4" stroke={color} strokeWidth="1.2" />
        <path
          d="M27 11H13C11.8954 11 11 11.8954 11 13V27C11 28.1046 11.8954 29 13 29H27C28.1046 29 29 28.1046 29 27V13C29 11.8954 28.1046 11 27 11Z"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M24 9V13"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 9V13"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11 17H29"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_296_2208">
          <rect width="40" height="40" fill={color} />
        </clipPath>
      </defs>
    </SvgIcon>
  )
}
export default IcoCalendar
