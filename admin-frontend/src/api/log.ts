import request from '@/utils/request'

export function getLogs(params?: { page?: number; size?: number }) {
  return request.get('/logs', { params })
}
