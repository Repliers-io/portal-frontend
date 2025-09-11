import SvgIcon, { type SvgColorIconProps } from '@icons/SvgIcon'

const IcoRenovations = ({ color = '#fff', size = 40 }: SvgColorIconProps) => {
  return (
    <SvgIcon size={size} viewBox="0 0 40 40" fill="transparent">
      <g clipPath="url(#clip0_296_2215)">
        <circle cx="20" cy="20" r="19.4" stroke={color} strokeWidth="1.2" />
        <path
          d="M16.1818 24.1176H23.8182M18.0909 28.2353V28.8235C18.0909 29.4733 18.6607 30 19.3636 30H20.6364C21.3393 30 21.9091 29.4733 21.9091 28.8235V28.2353M27 16.4706C27 18.7529 26.2336 19.9726 24.9982 21.5727C24.2348 22.5615 23.8182 23.7405 23.8182 24.9552V26.4706C23.8182 27.1203 23.2484 27.6471 22.5455 27.6471H17.4545C16.7516 27.6471 16.1818 27.1203 16.1818 26.4706V24.9552C16.1818 23.7405 15.7652 22.5615 15.0018 21.5727C13.7664 19.9726 13 18.7529 13 16.4706C13 12.9412 16.1818 10 20 10C23.8182 10 27 12.9412 27 16.4706Z"
          stroke={color}
          strokeWidth="1.2"
        />
      </g>
      <defs>
        <clipPath id="clip0_296_2215">
          <rect width="40" height="40" fill={color} />
        </clipPath>
      </defs>
    </SvgIcon>
  )
}
export default IcoRenovations
