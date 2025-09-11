import { type SVGAttributes } from 'react'

type SvgIconProps = SVGAttributes<SVGElement> & {
  size?: number
}

export type SvgColorIconProps = SvgIconProps & {
  color?: string
}

const SvgIcon = ({ size = 20, children, ...rest }: SvgIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      {...rest}
    >
      {children}
    </svg>
  )
}

export default SvgIcon
