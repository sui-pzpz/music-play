import { post } from './httpClient'

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  uid: string
  nickname: string
  avatar: string | null
}

export interface SmsSendResponse {
  code: string
}

// 密码登录
export function loginByPassword(account: string, password: string) {
  return post<LoginResponse>('/auth/login', {
    type: 'password',
    account,
    password,
  })
}

// 验证码登录
export function loginBySms(phone: string, code: string) {
  return post<LoginResponse>('/auth/login', {
    type: 'sms',
    phone,
    code,
  })
}

// 发送验证码
export function sendSms(phone: string) {
  return post<SmsSendResponse>('/auth/sms/send', { phone })
}

// 注册
export function register(phone: string, code: string, password: string) {
  return post<null>('/auth/register', { phone, code, password })
}

// 重置密码
export function resetPassword(phone: string, code: string, newPassword: string) {
  return post<null>('/auth/password/reset', { phone, code, newPassword })
}

// 退出登录
export function logout() {
  return post<null>('/auth/logout')
}

// 刷新 Token
export function refreshToken(refreshTokenValue: string) {
  return post<LoginResponse>('/auth/refresh', { refreshToken: refreshTokenValue })
}
