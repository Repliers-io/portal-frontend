import SvgIcon, { type SvgColorIconProps } from '@icons/SvgIcon'

const IcoWork = ({ color = '#fff', size = 40 }: SvgColorIconProps) => {
  return (
    <SvgIcon size={size} viewBox="0 0 40 40" fill="transparent">
      <g>
        <circle cx="20" cy="20" r="19.4" stroke={color} strokeWidth="1.2" />
        <path
          d="M15.9437 13.9477V10C19.0923 10 22.241 10 25.3897 10V13.9477M9.87122 18.7257L20.6667 22.8354L31.4621 18.7257M9.87122 18.7257C9.87122 22.1505 9.87122 25.5752 9.87122 29H31.4621C31.4621 25.5752 31.4621 22.1505 31.4621 18.7257M9.87122 18.7257C9.87122 17.1331 9.87122 15.5404 9.87122 13.9477H31.4621C31.4621 15.5404 31.4621 17.1331 31.4621 18.7257"
          stroke={color}
          strokeWidth="1.2"
        />
      </g>
    </SvgIcon>
  )
}
export default IcoWork
