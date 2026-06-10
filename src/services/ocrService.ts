// OCR 识别服务 - 使用浏览器端 Tesseract.js 本地识别，无需外部 API

export interface OCRResult {
  success: boolean
  text: string
  lines: string[]
}

/**
 * 使用 Tesseract.js 在浏览器端识别图片中的文字
 * @param imageBase64 图片的 base64 编码（不含 data:image/... 前缀）
 * @param mimeType 图片的 MIME 类型，默认 image/jpeg
 */
export async function recognizeImage(imageBase64: string, mimeType = 'image/jpeg'): Promise<OCRResult> {
  try {
    // 动态导入 tesseract.js，避免首屏加载
    const Tesseract = await import('tesseract.js')

    const worker = await Tesseract.createWorker('chi_sim+eng')
    const result = await worker.recognize(`data:${mimeType};base64,${imageBase64}`)
    await worker.terminate()

    const text = result.data.text || ''
    // 按换行分割，过滤空行
    const lines = text
      .split(/\r?\n/)
      .map((line: string) => line.trim())
      .filter(Boolean)

    return { success: true, text, lines }
  } catch {
    return { success: false, text: '', lines: [] }
  }
}

/**
 * 从 OCR 识别结果中解析歌名和歌手
 * 常见格式：
 * - "歌名 歌手"
 * - "歌名-歌手"
 * - "歌名 歌手 其他信息"
 * - "序号 歌名 歌手"
 */
export function parseSongList(lines: string[]): { name: string; artist: string }[] {
  const songs: { name: string; artist: string }[] = []

  for (const line of lines) {
    // 去掉行首的序号（如 "1." "1、" "01." 等）
    const cleaned = line.replace(/^\d+[.、)\s]+/, '').trim()
    if (!cleaned) continue

    // 尝试按常见分隔符拆分歌名和歌手
    let name = cleaned
    let artist = ''

    // 格式：歌名 - 歌手
    if (cleaned.includes(' - ')) {
      const parts = cleaned.split(' - ')
      name = parts[0].trim()
      artist = parts.slice(1).join(' - ').trim()
    }
    // 格式：歌名—歌手（中文破折号）
    else if (cleaned.includes('—')) {
      const parts = cleaned.split('—')
      name = parts[0].trim()
      artist = parts.slice(1).join('—').trim()
    }
    // 格式：歌名 歌手（空格分隔，且歌手名较短）
    else if (cleaned.includes(' ')) {
      const parts = cleaned.split(/\s+/)
      if (parts.length >= 2) {
        const lastPart = parts[parts.length - 1]
        // 简单启发式：如果最后一部分是2-10个字符，可能是歌手名
        if (lastPart.length >= 2 && lastPart.length <= 10) {
          name = parts.slice(0, -1).join(' ')
          artist = lastPart
        }
      }
    }

    // 过滤明显不是歌名的行
    if (name.length < 2) continue
    if (/^[\d.、]+$/.test(name)) continue
    if (name.includes('播放') || name.includes('收藏') || name.includes('下载')) continue
    if (name.includes('歌单') || name.includes('推荐') || name.includes('排行榜')) continue
    if (name.includes('MV') || name.includes('VIP') || name.includes('SQ')) continue

    songs.push({ name, artist })
  }

  return songs
}
