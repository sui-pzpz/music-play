export type MusicPlatform = 'netease' | 'qq' | 'local'

export interface Song {
  id: number
  name: string
  artists: string
  album: string
  picUrl: string
  duration: number
  platform: MusicPlatform
  mid?: string
}

export interface LyricLine {
  time: number
  text: string
}

export interface SearchResult {
  songs: Song[]
  total: number
}

export interface PlayUrlData {
  url: string
  br: number
  level: string
  size: number
}

export interface LyricData {
  lrc: string
  tlyric: string
}

export interface Playlist {
  id: string
  name: string
  songs: Song[]
  createdAt: number
}
