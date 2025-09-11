import { secondary as defaultColor } from '@configs/colors'
import SvgIcon, { type SvgColorIconProps } from '@icons/SvgIcon'

const IcoPhoto = ({ color = defaultColor, size }: SvgColorIconProps) => {
  return (
    <SvgIcon size={size} viewBox="0 0 16 16">
      <g clipPath="url(#clip0_366_1837)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3.02227 2.3998C2.67863 2.3998 2.40005 2.67838 2.40005 3.02203V12.9776C2.40005 13.3212 2.67863 13.5998 3.02227 13.5998H12.9778C13.3215 13.5998 13.6 13.3212 13.6 12.9776V3.02203C13.6 2.67838 13.3215 2.3998 12.9778 2.3998H3.02227ZM0.800049 3.02203C0.800049 1.79473 1.79497 0.799805 3.02227 0.799805H12.9778C14.2051 0.799805 15.2 1.79473 15.2 3.02203V12.9776C15.2 14.2049 14.2051 15.1998 12.9778 15.1998H3.02227C1.79497 15.1998 0.800049 14.2049 0.800049 12.9776V3.02203Z"
          fill={color}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4 5.6C4 4.71634 4.71634 4 5.6 4C6.48366 4 7.2 4.71634 7.2 5.6C7.2 6.48366 6.48366 7.2 5.6 7.2C4.71634 7.2 4 6.48366 4 5.6Z"
          fill={color}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.1241 5.79687C10.4255 5.53386 10.8748 5.53386 11.1761 5.79687L14.9261 9.0696C15.259 9.36011 15.2934 9.86548 15.0028 10.1984C14.7123 10.5312 14.207 10.5656 13.8741 10.2751L10.6501 7.46143L2.92614 14.2023C2.59325 14.4929 2.08789 14.4585 1.79737 14.1256C1.50685 13.7928 1.5412 13.2874 1.87408 12.9969L10.1241 5.79687Z"
          fill={color}
        />
      </g>
      <defs>
        <clipPath id="clip0_366_1837">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </SvgIcon>
  )
}

export default IcoPhoto
