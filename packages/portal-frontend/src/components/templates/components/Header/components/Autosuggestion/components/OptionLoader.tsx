import { LinearProgress } from '@mui/material'

export const OptionLoader = ({ ...props }) => {
  return (
    <li {...props} style={{ padding: 16 }}>
      <LinearProgress color="primary" />
    </li>
  )
}
