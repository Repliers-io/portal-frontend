import SvgIcon, { type SvgColorIconProps } from '@icons/SvgIcon'

const IcoFile = ({ color = '#fff', size = 40 }: SvgColorIconProps) => {
  return (
    <SvgIcon size={size} viewBox="0 0 40 40" fill="transparent">
      <g>
        <circle cx="20" cy="20" r="19.4" stroke={color} strokeWidth="1.2" />
        <path d="M18.5834 10V16.25H12.3334" stroke={color} strokeWidth="1.2" />
        <path
          d="M23.5834 26.25H16.0834M23.5834 23.125H16.0834M23.5834 20H16.0834M18.5834 10H27.3334V30H12.3334V16.25L18.5834 10Z"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="square"
        />
      </g>
    </SvgIcon>
  )
}
export default IcoFile
