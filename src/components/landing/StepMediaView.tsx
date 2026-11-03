import Image from 'next/image'
import type { StepMedia } from '@/lib/landing-content'
import * as s from '@/app/steps-figma.css'

const CLUSTER_CLASS = {
  start: s.stepClusterStart,
  detail: s.stepClusterDetail,
  phoneA: s.stepClusterPhoneA,
  phoneB: s.stepClusterPhoneB,
} as const

type Props = { media: StepMedia }

export default function StepMediaView({ media }: Props) {
  switch (media.type) {
    case 'stack':
      return (
        <div className={s.stepFigmaStack}>
          <Image
            src={media.top}
            alt={media.alt}
            width={440}
            height={404}
            className={s.stepFigmaStackTop}
            sizes="(max-width: 768px) 90vw, 420px"
            unoptimized
          />
          <Image
            src={media.bottom}
            alt=""
            width={519}
            height={532}
            className={s.stepFigmaStackBottom}
            sizes="(max-width: 768px) 85vw, 480px"
            unoptimized
            aria-hidden
          />
        </div>
      )

    case 'single':
      return (
        <Image
          src={media.src}
          alt={media.alt}
          width={1200}
          height={900}
          className={s.stepFigmaSingle}
          style={media.round ? { borderRadius: media.round } : undefined}
          sizes="(max-width: 768px) 100vw, 560px"
          unoptimized
        />
      )

    case 'cluster':
      return (
        <div className={s.stepCluster} aria-label={media.alt}>
          {media.items.map((item) => (
            <Image
              key={item.slot}
              src={item.src}
              alt=""
              width={403}
              height={455}
              className={CLUSTER_CLASS[item.slot]}
              sizes="(max-width: 768px) 45vw, 280px"
              unoptimized
            />
          ))}
        </div>
      )

    case 'pair':
      return (
        <div className={s.stepPair}>
          <Image
            src={media.left}
            alt={media.alt}
            width={401}
            height={778}
            className={s.stepPairLeft}
            sizes="(max-width: 768px) 42vw, 320px"
            unoptimized
          />
          <span className={s.stepPairArrow} aria-hidden>
            →
          </span>
          <Image
            src={media.right}
            alt=""
            width={330}
            height={778}
            className={s.stepPairRight}
            sizes="(max-width: 768px) 38vw, 280px"
            unoptimized
            aria-hidden
          />
        </div>
      )

    case 'parent':
      return (
        <Image
          src={media.phone}
          alt={media.alt}
          width={398}
          height={938}
          className={s.stepParentPhone}
          sizes="(max-width: 768px) 70vw, 360px"
          unoptimized
        />
      )
  }
}
