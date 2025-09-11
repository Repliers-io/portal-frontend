import SvgIcon, { type SvgColorIconProps } from '@icons/SvgIcon'

const IcoPeople = ({ color = '#fff', size = 40 }: SvgColorIconProps) => {
  return (
    <SvgIcon size={size} viewBox="0 0 40 40" fill="transparent">
      <g stroke={color} strokeWidth="1.2" clipPath="url(#a)">
        <circle cx="20" cy="20" r="19.4" />
        <path
          strokeLinecap="round"
          d="M4 30c0-3.375 4.25-3.375 6.375-5.625 1.063-1.125-2.125-1.125-2.125-6.75C8.25 13.875 9.666 12 12.5 12s4.25 1.875 4.25 5.625c0 5.625-3.188 5.625-2.125 6.75C16.75 26.625 21 26.625 21 30"
        />
        <path
          strokeLinecap="round"
          d="M20 27.365c.824-.586 1.894-1.008 2.918-1.517.801-.398 1.573-.85 2.178-1.473 1.09-1.125-2.18-1.125-2.18-6.75 0-3.75 1.453-5.625 4.36-5.625 2.909 0 4.363 1.875 4.363 5.625 0 5.625-3.272 5.625-2.181 6.75C31.638 26.625 36 26.625 36 30"
        />
      </g>
      <defs>
        <clipPath id="a">
          <path fill={color} d="M0 0h40v40H0z" />
        </clipPath>
      </defs>
    </SvgIcon>
  )
}
export default IcoPeople
