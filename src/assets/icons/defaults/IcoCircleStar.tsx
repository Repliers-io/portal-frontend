import SvgIcon, { type SvgColorIconProps } from '@icons/SvgIcon'

const IcoCircleStar = ({ color = '#fff', size = 40 }: SvgColorIconProps) => {
  return (
    <SvgIcon size={size} viewBox="0 0 40 40" fill="transparent">
      <g stroke={color} strokeWidth="1.2" clipPath="url(#a)">
        <circle cx="20" cy="20" r="19.4" stroke={color} strokeWidth="1.2" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.275 9.29a.5.5 0 0 1 .908 0l3.097 6.714a.5.5 0 0 0 .395.287l7.341.87a.5.5 0 0 1 .28.864l-5.427 5.02a.5.5 0 0 0-.15.464l1.44 7.251a.5.5 0 0 1-.735.534l-6.45-3.611a.5.5 0 0 0-.49 0l-6.45 3.611a.5.5 0 0 1-.735-.534l1.44-7.251a.5.5 0 0 0-.15-.465L8.16 18.026a.5.5 0 0 1 .28-.864l7.342-.87a.5.5 0 0 0 .396-.287l3.096-6.713Z"
        />
      </g>
    </SvgIcon>
  )
}
export default IcoCircleStar
