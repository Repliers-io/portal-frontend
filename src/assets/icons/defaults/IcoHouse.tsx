import SvgIcon, { type SvgColorIconProps } from '@icons/SvgIcon'

const IcoHouse = ({ color = '#fff', size = 40 }: SvgColorIconProps) => {
  return (
    <SvgIcon size={size} viewBox="0 0 40 40" fill="transparent">
      <g stroke={color} strokeWidth="1.2">
        <circle cx="20" cy="20" r="19.4" />
        <path d="M7.826 17.407 20 10l12.174 7.407M23.044 30V19.63h-6.088V30m1.74-6.522v3.044m-7.827-10.966V30H29.13V15.556H10.87Z" />
      </g>
    </SvgIcon>
  )
}
export default IcoHouse
