export type ImageMeta = {
  width: number
  height: number
  /** 표시 최대 너비(px). 미설정 시 100% */
  maxWidth?: number
}

export const IMAGE_META: Record<string, ImageMeta> = {
  '/images/logo.png': { width: 347, height: 115, maxWidth: 121 },
  '/images/logo-light.png': { width: 608, height: 203, maxWidth: 120 },
  '/images/hero-screenshot.png': { width: 1440, height: 1135 },
  '/images/pain-excel.png': { width: 1024, height: 1024, maxWidth: 220 },
  '/images/pain-message.png': { width: 1280, height: 698, maxWidth: 320 },
  '/images/pain-search.png': { width: 1067, height: 1008, maxWidth: 260 },
  '/images/icon-folder.png': { width: 256, height: 256, maxWidth: 110 },
  '/images/icon-star.png': { width: 256, height: 256, maxWidth: 110 },
  '/images/icon-message.png': { width: 256, height: 256, maxWidth: 110 },
  '/images/icon-click.png': { width: 256, height: 256, maxWidth: 110 },
  '/images/value-clock.png': { width: 1024, height: 559, maxWidth: 280 },
  '/images/value-rocket.png': { width: 1024, height: 559, maxWidth: 280 },
  '/images/value-target.png': { width: 1024, height: 559, maxWidth: 280 },
  '/images/step0-class.png': { width: 1282, height: 1166 },
  '/images/step0-upload.png': { width: 1282, height: 1312 },
  '/images/step1-template.png': { width: 1440, height: 1127 },
  '/images/step2-lesson-main.png': { width: 3024, height: 1890 },
  '/images/step2-lesson-preview.png': { width: 962, height: 1086 },
  '/images/step6-dashboard.png': { width: 1278, height: 1450 },
  '/images/step6-complete.png': { width: 1078, height: 132 },
  '/images/steps/step0-a.png': { width: 440, height: 404 },
  '/images/steps/step0-b.png': { width: 519, height: 532 },
  '/images/steps/step1.png': { width: 1440, height: 1127 },
  '/images/steps/step2-media.png': { width: 1180, height: 1080 },
  '/images/steps/step3-start.png': { width: 403, height: 356 },
  '/images/steps/step3-detail.png': { width: 403, height: 455 },
  '/images/steps/step3-phone-a.png': { width: 194, height: 419 },
  '/images/steps/step3-phone-b.png': { width: 194, height: 420 },
  '/images/steps/step4.png': { width: 855, height: 574 },
  '/images/steps/step5-kakao.png': { width: 401, height: 778 },
  '/images/steps/step5-dash.png': { width: 330, height: 778 },
  '/images/steps/step6.png': { width: 1242, height: 979 },
  '/images/steps/parent-phone.png': { width: 398, height: 938 },
  '/images/cta-gift.png': { width: 1024, height: 1024, maxWidth: 500 },
  '/images/solution-bg.jpg': { width: 1920, height: 1280 },
}

export function getImageMeta(src: string): ImageMeta {
  return IMAGE_META[src] ?? { width: 1200, height: 800 }
}
