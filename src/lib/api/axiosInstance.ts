import axios from 'axios'
import { deleteCookie, getCookie, setCookie } from 'cookies-next'

const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터: 액세스 토큰 자동 부착
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      const headers = config.headers
      if (headers && typeof headers.delete === 'function') {
        headers.delete('Content-Type')
      } else {
        delete config.headers['Content-Type']
        delete config.headers['content-type']
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 응답 인터셉터: 401 시 silent refresh 후 재시도
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token!)
  })
  failedQueue = []
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    const isAuthRequest =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/signup') ||
      originalRequest.url?.includes('/auth/password-reset') ||
      originalRequest.url?.includes('/auth/refresh')

    // 인증 관련 요청은 인터셉터에서 처리하지 않음
    if (isAuthRequest) return Promise.reject(error)

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 이미 refresh 중이면 대기열에 추가
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return axiosInstance(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = getCookie('refreshToken')
        if (!refreshToken) throw new Error('No refresh token')

        const { data } = await axiosInstance.post('/auth/refresh', {
          refresh_token: refreshToken,
        })

        const newAccessToken = data.data.access_token
        const newRefreshToken = data.data.refresh_token

        // 토큰 갱신
        localStorage.setItem('accessToken', newAccessToken)
        setCookie('accessToken', newAccessToken, { maxAge: 60 * 60 * 24 * 7, path: '/' })
        setCookie('refreshToken', newRefreshToken, { maxAge: 60 * 60 * 24 * 7, path: '/' })

        processQueue(null, newAccessToken)

        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)

        // refresh 실패 → 로그아웃
        localStorage.removeItem('accessToken')
        deleteCookie('accessToken', { path: '/' })
        deleteCookie('refreshToken', { path: '/' })
        window.location.href = '/login'

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance