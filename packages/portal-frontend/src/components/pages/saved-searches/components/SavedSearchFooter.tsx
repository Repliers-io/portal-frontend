import { IconButton, Stack, Typography } from '@mui/material'

import {
  BoltIcon,
  DeleteOutlinedIcon,
  EditNotificationsOutlinedIcon,
  MailOutlineIcon
} from '@configs/icons'

import { type ApiSavedSearch } from 'services/API'
import { useSaveSearch } from 'providers/SaveSearchProvider'
import { capitalize } from 'utils/strings'

const SavedSearchFooter = ({ search }: { search: ApiSavedSearch }) => {
  const { searchId, notificationFrequency } = search
  const { setEditId, setDeleteId } = useSaveSearch()

  const handleEdit = () => setEditId(searchId)
  const handleDelete = () => setDeleteId(searchId)

  return (
    <Stack
      spacing={1}
      direction="row"
      alignItems="center"
      justifyContent="space-between"
    >
      <Stack
        spacing={1}
        direction="row"
        alignItems="center"
        sx={{ color: 'text.hint' }}
      >
        {notificationFrequency === 'instant' ? (
          <BoltIcon sx={{ fontSize: 20 }} />
        ) : (
          <MailOutlineIcon sx={{ fontSize: 18 }} />
        )}

        <Typography color="text.hint" variant="body2">
          {capitalize(notificationFrequency)}
        </Typography>
      </Stack>

      <Stack spacing={1} direction="row">
        <IconButton size="small" disableFocusRipple onClick={handleEdit}>
          <EditNotificationsOutlinedIcon sx={{ fontSize: 24 }} />
        </IconButton>

        <IconButton size="small" disableFocusRipple onClick={handleDelete}>
          <DeleteOutlinedIcon sx={{ fontSize: 24 }} />
        </IconButton>
      </Stack>
    </Stack>
  )
}

export default SavedSearchFooter
