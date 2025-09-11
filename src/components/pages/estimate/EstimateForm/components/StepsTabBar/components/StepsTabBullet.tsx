import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import TaskAltIcon from '@mui/icons-material/TaskAlt'
import { Box } from '@mui/material'

const StepsTabBullet = ({
  valid,
  active,
  available
}: {
  valid?: boolean
  active?: boolean
  available?: boolean
}) => {
  let type = valid ? 'valid' : valid === false ? 'error' : 'empty'
  // NOTE: special case where user logged in while filling in the form
  // and we got 2 last steps disabled (maybe even with errors),
  // but we should ignore them if they are not reachable
  if (valid === false && !available) type = 'valid'

  const color = !available // step can be valid but unavailable
    ? 'text.hint'
    : valid
      ? 'primary.main'
      : valid === false
        ? 'error.main'
        : active
          ? 'primary.main'
          : 'text.hint'

  const Bullet =
    type === 'error' // not valid, red bullet
      ? RadioButtonCheckedIcon
      : type === 'valid'
        ? TaskAltIcon
        : RadioButtonUncheckedIcon // empty dot, status unknown

  return (
    <Box sx={{ width: 24, height: 24 }}>
      <Bullet sx={{ color, fontSize: 26 }} />
    </Box>
  )
}

export default StepsTabBullet
