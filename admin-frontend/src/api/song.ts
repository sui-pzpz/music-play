import request from '@/utils/request'

export function getSongs(params: {
  page?: number
  size?: number
  keyword?: string
  status?: number
  isVip?: number
  artistId?: string
  albumId?: string
  sortBy?: string
  sortOrder?: string
}) {
  return request.get('/songs', { params })
}

export function getSongDetail(songId: string) {
  return request.get(`/songs/${songId}`)
}

export function createSong(data: {
  name: string
  artistIds: string[]
  albumId?: string
  duration: number
  isVip?: boolean
  hasStandard?: boolean
  hasHigh?: boolean
  hasLossless?: boolean
  lyricUrl?: string
  tlyricUrl?: string
  source: string
  sourceId: string
  status?: number
}) {
  return request.post('/songs', data)
}

export function updateSong(songId: string, data: {
  name?: string
  artistIds?: string[]
  albumId?: string
  duration?: number
  isVip?: boolean
  hasStandard?: boolean
  hasHigh?: boolean
  hasLossless?: boolean
  lyricUrl?: string
  tlyricUrl?: string
  source?: string
  sourceId?: string
}) {
  return request.put(`/songs/${songId}`, data)
}

export function updateSongStatus(songId: string, status: number) {
  return request.put(`/songs/${songId}/status`, { status })
}

export function deleteSong(songId: string) {
  return request.delete(`/songs/${songId}`)
}
