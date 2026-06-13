import request from '@/utils/request'

export function getUsers(params: {
  page?: number
  size?: number
  keyword?: string
  status?: number
  startDate?: string
  endDate?: string
}) {
  return request.get('/users', { params })
}

export function getUserDetail(uid: string) {
  return request.get(`/users/${uid}`)
}

export function updateUser(uid: string, data: {
  nickname?: string
  avatar?: string
  gender?: number
  birthday?: string
  signature?: string
}) {
  return request.put(`/users/${uid}`, data)
}

export function updateUserStatus(uid: string, status: number, reason?: string) {
  return request.put(`/users/${uid}/status`, { status, reason })
}

export function deleteUser(uid: string) {
  return request.delete(`/users/${uid}`)
}

export function getUserHistory(uid: string, params?: { page?: number; size?: number }) {
  return request.get(`/users/${uid}/history`, { params })
}

export function getUserFavorites(uid: string, params?: { page?: number; size?: number }) {
  return request.get(`/users/${uid}/favorites`, { params })
}
