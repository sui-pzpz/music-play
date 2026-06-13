import request from '@/utils/request'

export function login(username: string, password: string) {
  return request.post('/login', { username, password })
}

export function getProfile() {
  return request.get('/profile')
}

export function logout() {
  return request.post('/logout')
}
