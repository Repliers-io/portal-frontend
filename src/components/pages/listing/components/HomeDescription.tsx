/* eslint-disable react/no-danger */
import { Stack, Typography } from '@mui/material'

import { scrubbedDescriptionLabel } from '@configs/properties'

import { ScrubbedText } from 'components/atoms'

import { useProperty } from 'providers/PropertyProvider'
import { formatMultiLineText, scrubbed } from 'utils/properties'

const HomeDescription = () => {
  const {
    property: {
      details: { description }
    }
  } = useProperty()

  // WARN: multiline formatter returns non-empty string for any type of input
  const formattedDescription = formatMultiLineText(description || '')

  return (
    <Stack spacing={3} id="description" sx={{ mt: '-33px', pt: 4 }}>
      <Typography variant="h4">Description</Typography>
      <Typography
        component="div"
        sx={{
          my: -2,
          overflow: 'hidden',
          color: 'text.secondary'
        }}
      >
        {scrubbed(description) ? (
          <p>
            <ScrubbedText replace={scrubbedDescriptionLabel} />
          </p>
        ) : (
          <div
            dangerouslySetInnerHTML={{
              __html: formattedDescription
            }}
          />
        )}
      </Typography>
    </Stack>
  )
}

export default HomeDescription
