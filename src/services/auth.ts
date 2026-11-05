import axiosInstance from '@/lib/api/axiosInstance'
import { setCookie, deleteCookie, getCookie } from 'cookies-next'
import type { User } from '@/types/user'

interface LoginRequest {
  email: string
  password: string
}

interface SignupRequest {
  email: string
  password: string
  name: string
  phone: string
}

interface AuthTokens {
  access_token: string
  refresh_token: string
}

interface LoginResponse {
  success: boolean
  data: AuthTokens & {
    user: User
  }
}

interface SignupResponse {
  success: boolean
  data: {
    user: User
  }
}

interface RefreshResponse {
  success: boolean
  data: AuthTokens
}

interface MeResponse {
  success: boolean
  data: User
}

interface UpdateMeRequest {
  name?: string
  email?: string
  phone?: string
  current_password?: string
}

interface UpdateMeResponse {
  success: boolean
  data: User
}

interface ChangePasswordRequest {
  current_password: string
  new_password: string
}

interface WithdrawRequest {
  password: string
}

interface ResetPasswordRequest {
  email: string
  phone: string
  new_password: string
}

const setTokens = (accessToken: string, refreshToken: string) => {
  setCookie('accessToken', accessToken, { maxAge: 60 * 60 * 24 * 7, path: '/' })
  setCookie('refreshToken', refreshToken, { maxAge: 60 * 60 * 24 * 7, path: '/' })
  localStorage.setItem('accessToken', accessToken)
}

const clearTokens = () => {
  deleteCookie('accessToken', { path: '/' })
  deleteCookie('refreshToken', { path: '/' })
  localStorage.removeItem('accessToken')
}

/** HTTP + token helpers only — callers own Zustand user state. */
export const auth = {
  async login({ email, password }: LoginRequest) {
    const { data } = await axiosInstance.post<LoginResponse>('/auth/login', { email, password })
    setTokens(data.data.access_token, data.data.refresh_token)
    return data.data.user
  },

  async signup({ email, password, name, phone }: SignupRequest) {
    const { data } = await axiosInstance.post<SignupResponse>('/auth/signup', {
      email,
      password,
      name,
      phone,
    })
    return data.data.user
  },

  async logout() {
    const refreshToken = getCookie('refreshToken')
    try {
      await axiosInstance.post('/auth/logout', { refresh_token: refreshToken })
    } finally {
      clearTokens()
    }
  },

  async refresh() {
    const refreshToken = getCookie('refreshToken')
    const { data } = await axiosInstance.post<RefreshResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    })
    setTokens(data.data.access_token, data.data.refresh_token)
    return data.data.access_token
  },

  async me() {
    const { data } = await axiosInstance.get<MeResponse>('/auth/me')
    return data.data
  },

  async updateMe(payload: UpdateMeRequest) {
    const { data } = await axiosInstance.patch<UpdateMeResponse>('/auth/me', payload)
    return data.data
  },

  async changePassword(payload: ChangePasswordRequest) {
    await axiosInstance.patch('/auth/password', payload)
  },

  async resetPassword(payload: ResetPasswordRequest) {
    await axiosInstance.post('/auth/password-reset', payload)
  },

  async withdraw(payload: WithdrawRequest) {
    await axiosInstance.delete('/auth/withdraw', { data: payload })
    clearTokens()
  },
}

export const authService = auth

export { setTokens, clearTokens }
