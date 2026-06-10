import type { LyricLine } from '@/types'

export function parseLrc(lrcText: string): LyricLine[] {
  const lines = lrcText.split(/\r?\n/)
  const result: LyricLine[] = []

  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g

  for (const line of lines) {
    const timeMatches = [...line.matchAll(timeRegex)]
    if (timeMatches.length === 0) continue

    const text = line.replace(/\[\d{2}:\d{2}\.\d{2,3}\]/g, '').trim()
    if (!text) continue

    for (const match of timeMatches) {
      const minutes = parseInt(match[1], 10)
      const seconds = parseInt(match[2], 10)
      const milliseconds = match[3].length === 2
        ? parseInt(match[3], 10) * 10
        : parseInt(match[3], 10)
      const time = minutes * 60 + seconds + milliseconds / 1000
      result.push({ time, text })
    }
  }

  result.sort((a, b) => a.time - b.time)
  return result
}

export function findCurrentLine(lyrics: LyricLine[], currentTime: number): number {
  if (lyrics.length === 0) return -1

  let low = 0
  let high = lyrics.length - 1

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    if (lyrics[mid].time <= currentTime) {
      low = mid + 1
    } else {
      high = mid - 1
    }
  }

  return high >= 0 ? high : -1
}
