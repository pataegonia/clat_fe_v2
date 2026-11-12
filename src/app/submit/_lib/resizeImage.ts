/**
 * 고른 사진을 긴 변 1,600px JPEG로 줄인다(서버도 같은 크기로 다시 저장한다).
 * 캔버스로 다시 그리므로 위치 정보(EXIF·GPS)도 빠진다. 읽을 수 없는 파일이면 throw한다.
 */
const MAX_LONG_SIDE = 1600
const JPEG_QUALITY = 0.85

type Decoded = {
  source: CanvasImageSource
  width: number
  height: number
  release: () => void
}

async function decodeWithBitmap(file: File): Promise<Decoded> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  return {
    source: bitmap,
    width: bitmap.width,
    height: bitmap.height,
    release: () => bitmap.close(),
  }
}

async function decodeWithImage(file: File): Promise<Decoded> {
  const url = URL.createObjectURL(file)
  const image = new Image()
  image.src = url
  try {
    await image.decode()
  } catch (e) {
    URL.revokeObjectURL(url)
    throw e
  }
  return {
    source: image,
    width: image.naturalWidth,
    height: image.naturalHeight,
    release: () => URL.revokeObjectURL(url),
  }
}

async function decode(file: File): Promise<Decoded> {
  try {
    return await decodeWithBitmap(file)
  } catch {
    // createImageBitmap이 없거나 imageOrientation 옵션을 모르는 브라우저.
    // <img>도 사진 방향을 맞춰 그린다.
    return decodeWithImage(file)
  }
}

function toJpeg(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('JPEG로 바꾸지 못했어요'))),
      'image/jpeg',
      JPEG_QUALITY
    )
  })
}

export async function resizeImage(file: File): Promise<Blob> {
  const decoded = await decode(file)
  try {
    if (decoded.width === 0 || decoded.height === 0) throw new Error('빈 사진이에요')
    const scale = Math.min(1, MAX_LONG_SIDE / Math.max(decoded.width, decoded.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(decoded.width * scale))
    canvas.height = Math.max(1, Math.round(decoded.height * scale))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('캔버스를 쓸 수 없어요')
    // 투명한 PNG가 검게 바뀌지 않게 흰 바탕에 그린다.
    context.fillStyle = 'white'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.imageSmoothingQuality = 'high'
    context.drawImage(decoded.source, 0, 0, canvas.width, canvas.height)
    return await toJpeg(canvas)
  } finally {
    decoded.release()
  }
}
