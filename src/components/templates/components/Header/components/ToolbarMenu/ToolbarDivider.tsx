import { Divider } from '@mui/material'

const ToolbarDivider = () => (
  <Divider
    key="divider"
    sx={{
      mx: { xs: 2, sm: 12, md: 1, lg: 2 },
      borderLeft: 1,
      borderColor: 'divider',
      width: { xs: '80%', sm: '70%', md: 'auto' }
    }}
  />
)

export default ToolbarDivider
