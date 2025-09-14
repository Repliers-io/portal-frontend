import SvgIcon, { type SvgColorIconProps } from '@icons/SvgIcon'

const IcoMarketActivity = ({
  color = '#fff',
  size = 40
}: SvgColorIconProps) => {
  return (
    <SvgIcon size={size} viewBox="0 0 40 40" fill="transparent">
      <g clipPath="url(#clip0_296_2229)">
        <circle cx="20" cy="20" r="19.4" stroke={color} strokeWidth="1.2" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10 20L10 29H14V20H10Z"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M18 11V29H22V11H18Z"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M26 15V29H30V15H26Z"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_296_2229">
          <rect width="40" height="40" fill={color} />
        </clipPath>
      </defs>
    </SvgIcon>
  )
}
export default IcoMarketActivity
