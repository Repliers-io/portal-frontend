'use client'

import React, {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import { jwtDecode, type JwtPayload } from 'jwt-decode'

import { profileKey } from '@configs/storage'

import {
  APIAuth,
  APIUser,
  type ApiUserProfile,
  type AuthCallbackResponse,
  type AuthProvider
} from 'services/API'
import { sanitizePhoneNumber } from 'utils/properties/sanitizers'
import {
  clearTokenSync,
  expired,
  getTokenSync,
  refreshNeeded,
  setToken
} from 'utils/tokens'

type OtpLoginValues = {
  fname: string
  lname: string
  email: string
  phone?: string
}

export const roles = {
  1: 'root',
  2: 'user',
  3: 'admin',
  4: 'agent'
} as const

export type UserRoleIndex = keyof typeof roles

type CustomJwtPayload = JwtPayload & {
  role?: UserRoleIndex
}

export type UserRole = (typeof roles)[UserRoleIndex]

type ProfilePromise = Promise<Partial<ApiUserProfile> | null>

export type UserProfile = Pick<
  ApiUserProfile,
  | 'clientId'
  | 'agentId'
  | 'email'
  | 'fname'
  | 'lname'
  | 'phone'
  | 'status'
  | 'preferences'
  | 'tags'
  | 'externalId'
  | 'createdOn'
> & { role: UserRole }

type UserContextType = {
  logged: boolean
  loading: boolean
  profile: UserProfile
  role: UserRole
  userRole: boolean
  agentRole: boolean
  adminRole: boolean
  update: (data: Partial<ApiUserProfile>) => Promise<boolean>
  requestOtpLogin: (values: OtpLoginValues) => Promise<{
    status: number
    data?: any
  }>
  login: (provider: AuthProvider, code: string) => ProfilePromise
  loginWithOtp: (code: string) => ProfilePromise
  loginWithToken: (token: string) => ProfilePromise
  logout: () => void
}

// TODO: could become part of APIAuth module
const parseAuthResponse = (response: AuthCallbackResponse) => {
  if (!response) return
  const { profile, token } = response

  if (!token) throw Error('Response or token is empty.')

  const { sub, role = 2 } = jwtDecode<CustomJwtPayload>(token)

  const clientId = Number(sub)
  const roleName = roles[role as UserRoleIndex]
  const agentId = roleName === 'agent' ? Number(sub) : null

  return {
    profile: {
      ...profile,
      role: roleName,
      roleIndex: role,
      clientId,
      agentId
    },
    token
  }
}

const removeTokenFromUrl = () => {
  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href)
    url.searchParams.delete('token')
    window.history.replaceState({}, '', url.toString())
  }
}

const UserContext = createContext<UserContextType | undefined>(undefined)

const UserProvider = ({ children }: { children: ReactNode }) => {
  const localProfile =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem(profileKey)
      : null

  const [profile, setProfile] = useState(
    localProfile ? JSON.parse(localProfile) : {}
  )
  const [loading, setLoading] = useState(false)
  // eslint-disable-next-line no-undef
  const refreshTimeout = useRef<NodeJS.Timeout | null>(null)
  const token = getTokenSync()
  const logged = Boolean(token)

  const saveProfile = (data: Partial<ApiUserProfile>) => {
    setProfile(data)
    localStorage.setItem(profileKey, JSON.stringify(data))
  }

  const processAuthResponse = (response: AuthCallbackResponse) => {
    const { profile, token = '' } = parseAuthResponse(response) || {}

    if (profile) {
      saveProfile(profile)
      setToken(token)
      return profile
    }
    return null
  }

  const logout = () => {
    clearTokenSync()
    setProfile({})
    localStorage.removeItem(profileKey)
    // TODO: not sure if we need this, lets check site behavior without it
    window.location.reload()
  }

  const login = async (provider: AuthProvider, code: string) => {
    try {
      setLoading(true)
      const response = await APIAuth.authCallback(provider, { code })
      return processAuthResponse(response)
    } catch (error) {
      console.error('[UserProvider] login failed', error)
      return null
    } finally {
      setLoading(false)
    }
  }

  const requestOtpLogin = async (
    values: OtpLoginValues
  ): Promise<{ status: number; data?: any }> => {
    const { fname, lname, email, phone } = values
    const loginFields = {
      email,
      ...(phone && { phone: sanitizePhoneNumber(phone) })
    }

    setLoading(true)
    let status: number = 200

    try {
      await APIAuth.login(loginFields)
    } catch (loginError: any) {
      status = loginError.status
    }

    if (status === 404) {
      const signupFields = {
        fname,
        lname,
        email,
        ...(phone && { phone: sanitizePhoneNumber(phone) })
      }

      try {
        await APIAuth.signup(signupFields)
        // login failed BUT we successfully registered new user
        // emulate 200 ok status from signup to proceed with OTP request
        status = 200
      } catch (signupError: any) {
        return signupError
      } finally {
        setLoading(false)
      }
    }
    setLoading(false)
    return { status }
  }

  const loginWithToken = async (token: string) => {
    try {
      setLoading(true)
      const response = await APIAuth.tokenLogin(token)
      removeTokenFromUrl()
      return processAuthResponse(response.result)
    } finally {
      setLoading(false)
    }
  }

  const loginWithOtp = async (code: string) => {
    try {
      setLoading(true)
      const response = await APIAuth.confirmOtp(code)
      return processAuthResponse(response)
    } finally {
      setLoading(false)
    }
  }

  const update = async (data: Partial<ApiUserProfile>) => {
    if (!logged) return false

    try {
      setLoading(true)
      await APIUser.update(data)
      saveProfile({ ...profile, ...data })
      return true
    } catch (error) {
      // TODO: do not show error message, but pass status code to the caller
      console.error('[UserProvider] profile update failed', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const refresh = () => {
    if (refreshTimeout.current) {
      clearTimeout(refreshTimeout.current)
    }
    refreshTimeout.current = setTimeout(async () => {
      try {
        setLoading(true)
        const { token } = await APIAuth.refresh()
        setToken(token)
      } finally {
        setLoading(false)
      }
    }, 10000)
  }

  useEffect(() => {
    if (!token) return
    if (expired(token)) {
      logout()
    } else if (refreshNeeded(token)) {
      refresh()
    }
  }, [])

  const contextValue = React.useMemo(
    () =>
      ({
        profile,
        role: profile.role,
        userRole: profile.role === 'user', // simple boolean flags as we use them ~50 times in the app
        agentRole: profile.role === 'agent' || profile.role === 'admin',
        adminRole: profile.role === 'admin',
        loading,
        logged,
        login,
        logout,
        update,
        refresh,
        loginWithOtp,
        loginWithToken,
        requestOtpLogin
      }) as UserContextType,
    [profile, logged, loading]
  )

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  )
}

export default UserProvider

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw Error('useUser must be used within a UserProvider')
  }
  return context
}
