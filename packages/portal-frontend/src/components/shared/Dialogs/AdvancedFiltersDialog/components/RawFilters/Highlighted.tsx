import { Box } from '@mui/material'

import { splitOnMatch } from 'utils/strings'

import { matchColor } from './styles'

/** `text` with the searched part in a yellow chip; its padding is taken back so the letters stay put. */
export const Highlighted = ({
  text,
  match
}: {
  text: string
  match?: string
}) => {
  const [before, found, after] = (match && splitOnMatch(text, match)) || [text]
  return (
    <>
      {before}
      {found && (
        <Box
          component="mark"
          sx={{
            px: '2px',
            mx: '-2px',
            borderRadius: '4px',
            bgcolor: matchColor,
            color: 'inherit'
          }}
        >
          {found}
        </Box>
      )}
      {after}
    </>
  )
}
