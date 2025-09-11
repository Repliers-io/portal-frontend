import { Typography } from '@mui/material'

const Annotation = () => {
  return (
    <Typography variant="caption" component="div" color="text.hint">
      <li>
        <b>Excellent</b> – Top condition, high-end materials, move-in ready.
      </li>
      <li>
        <b>Good</b> – Well-maintained with quality finishes and minimal wear.
      </li>
      <li>
        <b>Average</b> – Functional and livable, with some aging or outdated
        features.
      </li>
      <li>
        <b>Fair</b> – Noticeable wear, some repairs or updates needed.
      </li>
      <li>
        <b>Poor</b> – Significant issues, major repairs or renovations required.
      </li>
    </Typography>
  )
}

export default Annotation
