import EditIcon from '@mui/icons-material/Edit'
import { Box, IconButton, Skeleton, Stack, Typography } from '@mui/material'

import { useDialog } from 'providers/DialogProvider'
import { useUser } from 'providers/UserProvider'
import useClientSide from 'hooks/useClientSide'

import ProfileAvatar from '../../ProfileAvatar'

const DashboardProfile = () => {
  const clientSide = useClientSide()
  const { profile } = useUser()
  const { fname, lname, email } = profile || {}
  const { showDialog: showProfileEditDialog } = useDialog('profile')

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        minHeight: 64,
        borderRadius: 2,
        bgcolor: 'background.default'
      }}
    >
      <Stack spacing={{ xs: 2, sm: 3 }} direction="row" alignItems="center">
        <ProfileAvatar size={64} />

        <Stack spacing={1}>
          {clientSide ? (
            <Stack spacing={1} direction="row" alignItems="center">
              <Typography variant="h2">
                Hello, {fname}
                <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  {' '}
                  {lname}
                </Box>
                !
              </Typography>

              <IconButton
                size="small"
                disableFocusRipple
                sx={{ width: 32, height: 32 }}
                onClick={showProfileEditDialog}
              >
                <EditIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Stack>
          ) : (
            <Skeleton
              variant="text"
              sx={{ width: { xs: 150, sm: 300 }, height: 36 }}
            />
          )}

          {clientSide ? (
            <Typography variant="body2">{email}</Typography>
          ) : (
            <Skeleton variant="text" sx={{ width: 150, height: 20 }} />
          )}
        </Stack>
      </Stack>
    </Box>
  )
}

export default DashboardProfile
