import React, { useEffect, useState } from 'react'

import { Stack } from '@mui/material'

import { APIUser } from 'services/API'
import { useUser } from 'providers/UserProvider'
import useIntersectionObserver from 'hooks/useIntersectionObserver'

import ProfileTemplate, { type ProfileDetails } from './ProfileTemplate'

const Profile = () => {
  const { logged } = useUser()
  const [visible, containerRef] = useIntersectionObserver(0.5)
  const [profile, setProfile] = useState<ProfileDetails | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAgentData = async () => {
    try {
      setLoading(true)
      const agentData = await APIUser.fetchAgent()
      setProfile({
        fname: agentData.fname,
        lname: agentData.lname,
        email: agentData.email,
        phone: agentData.phone,
        avatar: agentData.avatar
      })
    } catch (err) {
      console.error('Failed to fetch agent profile:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (visible) {
      fetchAgentData()
    }
  }, [visible, logged])

  return (
    <Stack
      spacing={{ xs: 2, sm: 2.5 }}
      direction="row"
      alignItems="center"
      ref={containerRef}
    >
      <ProfileTemplate profile={profile} loading={loading} />
    </Stack>
  )
}

export default Profile
