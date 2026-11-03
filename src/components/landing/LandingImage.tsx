import Image, { type ImageProps } from 'next/image'
import type { CSSProperties } from 'react'
import { getImageMeta } from '@/lib/image-dimensions'
import * as s from '@/app/landing.css'

type LandingImageProps = {
  src: string
  alt: string
  className?: string
  priority?: boolean
  sizes?: string
  fit?: 'contain' | 'cover'
  /** CSS max-width override (px or string) */
  maxWidth?: number | string
  /** CSS width override — 고정 크기 아이콘 등 */
  displayWidth?: number | string
  displayHeight?: number | string
} & Pick<ImageProps, 'aria-hidden'>

export default function LandingImage({
  src,
  alt,
  className,
  priority,
  sizes,
  fit = 'contain',
  maxWidth,
  displayWidth,
  displayHeight,
  ...rest
}: LandingImageProps) {
  const meta = getImageMeta(src)
  const resolvedMaxWidth = maxWidth ?? meta.maxWidth

  const style: CSSProperties = {
    width: displayWidth ?? (resolvedMaxWidth ? 'auto' : '100%'),
    height: displayHeight ?? 'auto',
    maxWidth: resolvedMaxWidth
      ? typeof resolvedMaxWidth === 'number'
        ? `${resolvedMaxWidth}px`
        : resolvedMaxWidth
      : undefined,
    objectFit: fit,
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={meta.width}
      height={meta.height}
      className={`${s.responsiveImage}${className ? ` ${className}` : ''}`}
      style={style}
      priority={priority}
      sizes={sizes ?? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px'}
      {...rest}
    />
  )
}
