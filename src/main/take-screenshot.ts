import { desktopCapturer, screen } from 'electron'

/**
 * 长边上限。主流视觉模型在服务端会自行降采样：
 * - Qwen-VL 系列受 max_pixels 约束（默认约 100 万像素），超出即缩放
 * - OpenAI 系（gpt-4o/gpt-5）超过 2048 长边会先缩放再切 tile
 * 因此上传超过该上限的原始像素模型无法感知，只会拖慢首 token。
 * 1568 = 56 × 28，对齐 Qwen 的 patch 网格；此尺寸下模型可感知的信息量无损失。
 */
const MAX_SCREENSHOT_EDGE = 1568
/** 屏幕截图以文字为主，高质量 JPEG 可保持文字边缘清晰 */
const JPEG_QUALITY = 90

export function takeScreenshot(): Promise<string | void> {
  const mainWindow = global.mainWindow
  if (!mainWindow || mainWindow.isDestroyed()) return Promise.resolve()

  // Get the primary display's size.
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.size

  return desktopCapturer
    .getSources({ types: ['screen'], thumbnailSize: { width, height } })
    .then((sources) => {
      if (sources.length > 0) {
        let image = sources[0].thumbnail
        const imageSize = image.getSize()
        const longestEdge = Math.max(imageSize.width, imageSize.height)
        if (longestEdge > MAX_SCREENSHOT_EDGE) {
          const scale = MAX_SCREENSHOT_EDGE / longestEdge
          image = image.resize({
            width: Math.round(imageSize.width * scale),
            height: Math.round(imageSize.height * scale)
          })
        }
        return image.toJPEG(JPEG_QUALITY).toString('base64')
      }
      return undefined
    })
    .catch((error) => {
      console.error('Error taking screenshot:', error)
    })
}
