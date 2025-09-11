import SvgIcon, { type SvgColorIconProps } from '@icons/SvgIcon'

const IcoHeart = ({ color = '#ED7262', size }: SvgColorIconProps) => {
  return (
    <SvgIcon size={size} viewBox="0 0 23 20">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.5 3.9075C9.50067 1.60937 6.15975 0.899146 3.6547 3.00355C1.14964 5.10795 0.796966 8.62637 2.7642 11.1153C4.39982 13.1846 9.34979 17.549 10.9721 18.9616C11.1536 19.1197 11.2443 19.1987 11.3502 19.2297C11.4426 19.2568 11.5437 19.2568 11.6361 19.2297C11.742 19.1987 11.8327 19.1197 12.0142 18.9616C13.6366 17.549 18.5865 13.1846 20.2221 11.1153C22.1894 8.62637 21.8797 5.08581 19.3316 3.00355C16.7835 0.921283 13.4993 1.60937 11.5 3.9075Z"
        fill={color}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  )
}
export default IcoHeart
