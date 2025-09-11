import SvgIcon, { type SvgColorIconProps } from '@icons/SvgIcon'

const IcoRocket = ({ color = '#fff', size = 40 }: SvgColorIconProps) => {
  return (
    <SvgIcon size={size} viewBox="0 0 40 40" fill="transparent">
      <g stroke={color} strokeWidth="1.2">
        <circle cx="20" cy="20" r="19.4" />
        <path
          strokeLinejoin="round"
          d="m20 29 3.717-7.719m-5.576-5.343L10.087 19.5m5.576 1.781s-1.8 1.132-3.098 2.375C11.326 24.844 10.087 29 10.087 29s4.337-1.188 5.576-2.375c1.24-1.188 2.478-2.969 2.478-2.969m-2.478-2.375s1.363-4.868 4.337-7.718C23.717 10 29.913 10 29.913 10s0 5.938-3.717 9.5c-2.17 2.079-8.055 4.156-8.055 4.156l-2.478-2.375Zm9.293-4.75c0 .984-.832 1.782-1.858 1.782-1.027 0-1.859-.798-1.859-1.782 0-.983.832-1.781 1.859-1.781 1.026 0 1.858.797 1.858 1.781Z"
        />
      </g>
    </SvgIcon>
  )
}
export default IcoRocket
