import { Typography, type TypographyProps } from '@mui/material'

const Asterisk = (props: TypographyProps) => (
  <Typography component="span" color="error.main" fontWeight={700} {...props}>
    *
  </Typography>
)

export default Asterisk
