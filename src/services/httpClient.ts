const BASE_URL = '/api/v1'

interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback)
}

async function refreshToken(): Promise<string> {
  const refreshTokenValue = localStorage.getItem('refresh_token')
  if (!refreshTokenValue) {
    throw new Error('No refresh token')
  }

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: refreshTokenValue }),
  })

  const data: ApiResponse<{ accessToken: string; refreshToken: string; expiresIn: number }> = await res.json()

  if (data.code !== 200) {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    window.location.href = '/music-play/login'
    throw new Error('Refresh token failed')
  }

  localStorage.setItem('auth_token', data.data.accessToken)
  localStorage.setItem('refresh_token', data.data.refreshToken)
  return data.data.accessToken
}

async function request<T>(
  url: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('auth_token')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`

  let response = await fetch(fullUrl, {
    ...options,
    headers,
  })

  // 401 自动刷新 token
  if (response.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true
      try {
        const newToken = await refreshToken()
        isRefreshing = false
        onTokenRefreshed(newToken)

        // 用新 token 重试原请求
        headers['Authorization'] = `Bearer ${newToken}`
        response = await fetch(fullUrl, { ...options, headers })
        return response.json()
      } catch {
        isRefreshing = false
        throw new Error('认证已过期，请重新登录')
      }
    } else {
      // 等待刷新完成
      return new Promise<ApiResponse<T>>((resolve, reject) => {
        addRefreshSubscriber(async (newToken: string) => {
          headers['Authorization'] = `Bearer ${newToken}`
          try {
            const retryRes = await fetch(fullUrl, { ...options, headers })
            resolve(retryRes.json())
          } catch (e) {
            reject(e)
          }
        })
      })
    }
  }

  return response.json()
}

export function get<T>(url: string): Promise<ApiResponse<T>> {
  return request<T>(url, { method: 'GET' })
}

export function post<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  })
}

export function put<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  })
}

export function del<T>(url: string): Promise<ApiResponse<T>> {
  return request<T>(url, { method: 'DELETE' })
}

export type { ApiResponse }
