import { toPng } from 'html-to-image'

export async function exportElementAsPng(
  element: HTMLElement,
  filename: string,
  options: {
    backgroundColor?: string
    pixelRatio?: number
  } = {}
): Promise<void> {
  const { backgroundColor = '#FAF8F5', pixelRatio = 2 } = options

  try {
    const dataUrl = await toPng(element, {
      backgroundColor,
      pixelRatio,
      cacheBust: true,
      filter: (node) => {
        // Exclude interactive buttons with class 'no-export'
        if (node instanceof HTMLElement && node.classList.contains('no-export')) {
          return false
        }
        return true
      }
    })

    const link = document.createElement('a')
    link.download = `${filename}.png`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Failed to export PNG:', error)
    throw error
  }
}
