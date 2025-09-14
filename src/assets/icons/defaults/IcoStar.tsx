import SvgIcon, { type SvgColorIconProps } from '@icons/SvgIcon'

const IcoStar = ({ color = '#fff', size = 40 }: SvgColorIconProps) => {
  return (
    <SvgIcon size={size} viewBox="0 0 40 40" fill="transparent">
      <g stroke={color} strokeWidth="1.2" clipPath="url(#a)">
        <circle cx="20" cy="20" r="19.4" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.593 9.356a.448.448 0 0 1 .814 0l2.771 6.01c.066.141.2.239.354.257l6.573.78c.379.044.531.513.25.772l-4.858 4.494a.447.447 0 0 0-.135.416l1.29 6.491a.448.448 0 0 1-.658.478l-5.775-3.233a.448.448 0 0 0-.438 0l-5.775 3.233a.448.448 0 0 1-.657-.478l1.29-6.491a.447.447 0 0 0-.136-.416l-4.859-4.494a.448.448 0 0 1 .251-.773l6.573-.78a.448.448 0 0 0 .354-.256l2.771-6.01Z"
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
export default IcoStar
