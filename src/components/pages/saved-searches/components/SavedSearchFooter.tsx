import BoltIcon from '@mui/icons-material/Bolt'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import EditNotificationsOutlinedIcon from '@mui/icons-material/EditNotificationsOutlined'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import { IconButton, Stack, Typography } from '@mui/material'

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
