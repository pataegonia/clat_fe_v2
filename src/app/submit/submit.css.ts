import { keyframes, style, styleVariants } from '@vanilla-extract/css'
import { colors } from '@/styles/tokens/colors'
import { fontStyles } from '@/styles/tokens/typography'

/** 학생 숙제 제출 화면(/submit). 휴대폰 한 손 화면이 기준이다(출결 체크 화면과 같은 폭). */
const PHONE_MAX_WIDTH = '390px'

const textBase = {
  lineHeight: 1.4,
  letterSpacing: '-0.03em',
} as const

const spin = keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' },
})

// ---- 화면 틀 ----

export const page = style({
  minHeight: '100dvh',
  width: '100%',
  backgroundColor: colors.background,
  color: colors.gray900,
})

export const column = style({
  width: '100%',
  maxWidth: PHONE_MAX_WIDTH,
  margin: '0 auto',
  paddingTop: 'max(28px, env(safe-area-inset-top))',
  paddingBottom: 'max(32px, env(safe-area-inset-bottom))',
  paddingLeft: 'max(20px, env(safe-area-inset-left))',
  paddingRight: 'max(20px, env(safe-area-inset-right))',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
})

export const header = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
})

export const eyebrow = style({
  ...textBase,
  fontSize: fontStyles.labelSm.fontSize,
  fontWeight: 600,
  color: colors.primary500,
})

export const title = style({
  ...textBase,
  fontSize: fontStyles.headingLg.fontSize,
  fontWeight: fontStyles.headingLg.fontWeight,
  color: colors.gray900,
})

export const statusText = style({
  ...textBase,
  fontSize: fontStyles.bodyMd.fontSize,
  fontWeight: fontStyles.bodyMd.fontWeight,
  color: colors.gray600,
})

export const loadingText = style([statusText, { marginTop: '120px', textAlign: 'center' }])

export const errorText = style({
  ...textBase,
  fontSize: fontStyles.bodyMd.fontSize,
  fontWeight: fontStyles.bodyMd.fontWeight,
  color: colors.error500,
})

// ---- 버튼 ----

const buttonBase = style({
  ...textBase,
  width: '100%',
  borderRadius: '12px',
  fontSize: fontStyles.bodyLg.fontSize,
  fontWeight: 600,
  cursor: 'pointer',
  selectors: {
    '&:disabled': {
      opacity: 0.45,
      cursor: 'not-allowed',
    },
  },
})

export const primaryButton = style([
  buttonBase,
  {
    padding: '16px 12px',
    border: 'none',
    backgroundColor: colors.primary500,
    color: colors.white,
  },
])

export const secondaryButton = style([
  buttonBase,
  {
    padding: '14px 12px',
    border: `1px solid ${colors.gray100}`,
    backgroundColor: colors.white,
    color: colors.gray900,
  },
])

export const textButton = style({
  ...textBase,
  alignSelf: 'flex-start',
  padding: '4px 0',
  border: 'none',
  background: 'none',
  fontSize: fontStyles.bodyMd.fontSize,
  fontWeight: 600,
  color: colors.primary500,
  cursor: 'pointer',
  textDecoration: 'underline',
  textUnderlineOffset: '3px',
})

// ---- 안내 ----

export const card = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  padding: '20px',
  borderRadius: '16px',
  border: `1px solid ${colors.gray75}`,
  backgroundColor: colors.white,
})

export const noticeList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  paddingLeft: '18px',
  listStyle: 'disc',
})

export const noticeItem = style({
  ...textBase,
  fontSize: fontStyles.bodyLg.fontSize,
  fontWeight: fontStyles.bodyLg.fontWeight,
  color: colors.gray900,
  wordBreak: 'keep-all',
})

export const banner = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  padding: '14px 16px',
  borderRadius: '12px',
  border: `1px solid ${colors.warning200}`,
  backgroundColor: colors.warning50,
})

export const bannerTitle = style({
  ...textBase,
  fontSize: fontStyles.titleSm.fontSize,
  fontWeight: fontStyles.titleSm.fontWeight,
  color: colors.gray900,
})

export const bannerMeta = style({
  ...textBase,
  fontSize: fontStyles.labelSm.fontSize,
  fontWeight: fontStyles.labelSm.fontWeight,
  color: colors.gray700,
})

export const bannerText = style({
  ...textBase,
  fontSize: fontStyles.bodyMd.fontSize,
  fontWeight: fontStyles.bodyMd.fontWeight,
  color: colors.gray900,
  whiteSpace: 'pre-wrap',
  wordBreak: 'keep-all',
})

// ---- 낼 숙제 고르기 ----

export const section = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
})

export const sectionTitle = style({
  ...textBase,
  fontSize: fontStyles.titleMd.fontSize,
  fontWeight: fontStyles.titleMd.fontWeight,
  color: colors.gray900,
})

export const subTitle = style({
  ...textBase,
  marginTop: '6px',
  fontSize: fontStyles.titleSm.fontSize,
  fontWeight: fontStyles.titleSm.fontWeight,
  color: colors.gray700,
})

export const chipRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
})

const chipBase = style({
  ...textBase,
  padding: '8px 14px',
  borderRadius: '999px',
  fontSize: fontStyles.bodyMd.fontSize,
  fontWeight: 600,
  cursor: 'pointer',
  selectors: {
    '&:disabled': {
      opacity: 0.45,
      cursor: 'not-allowed',
    },
  },
})

export const chip = styleVariants({
  off: [
    chipBase,
    { border: `1px solid ${colors.gray100}`, backgroundColor: colors.white, color: colors.gray700 },
  ],
  on: [
    chipBase,
    {
      border: `1px solid ${colors.primary500}`,
      backgroundColor: colors.primary50,
      color: colors.primary500,
    },
  ],
})

const optionBase = style({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '2px',
  padding: '14px 16px',
  borderRadius: '12px',
  textAlign: 'left',
  cursor: 'pointer',
  selectors: {
    '&:disabled': {
      opacity: 0.45,
      cursor: 'not-allowed',
    },
  },
})

export const option = styleVariants({
  off: [optionBase, { border: `1px solid ${colors.gray75}`, backgroundColor: colors.white }],
  on: [optionBase, { border: `2px solid ${colors.primary500}`, backgroundColor: colors.primary50 }],
})

export const optionTitle = style({
  ...textBase,
  fontSize: fontStyles.labelSm.fontSize,
  fontWeight: 600,
  color: colors.primary500,
})

export const optionLabel = style({
  ...textBase,
  fontSize: fontStyles.bodyLg.fontSize,
  fontWeight: 600,
  color: colors.gray900,
  wordBreak: 'keep-all',
})

export const emptyText = style([statusText, { padding: '12px 0', textAlign: 'center' }])

// ---- 사진 넣기 ----

export const buttonRow = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '8px',
})

/**
 * 파일 고르기 창을 여는 input. 화면에서는 숨기되 display:none은 쓰지 않는다
 * (예전 iOS에서는 click()으로 열리지 않는다).
 */
export const hiddenInput = style({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0,
  opacity: 0,
})

export const thumbGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '8px',
})

export const thumb = style({
  position: 'relative',
  aspectRatio: '1 / 1',
  borderRadius: '10px',
  overflow: 'hidden',
  backgroundColor: colors.gray50,
})

export const thumbImage = style({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
})

export const thumbRemove = style({
  position: 'absolute',
  top: '4px',
  right: '4px',
  width: '28px',
  height: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  border: `1px solid ${colors.gray75}`,
  backgroundColor: colors.white,
  color: colors.gray900,
  cursor: 'pointer',
  selectors: {
    '&:disabled': {
      opacity: 0.45,
      cursor: 'not-allowed',
    },
  },
})

// ---- 내 지난 제출 ----

export const recentList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
})

export const recentItem = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  padding: '12px 14px',
  borderRadius: '12px',
  border: `1px solid ${colors.gray75}`,
  backgroundColor: colors.white,
})

export const recentHead = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
})

export const recentTitle = style({
  ...textBase,
  fontSize: fontStyles.titleSm.fontSize,
  fontWeight: fontStyles.titleSm.fontWeight,
  color: colors.gray900,
})

export const recentMeta = style({
  ...textBase,
  fontSize: fontStyles.labelSm.fontSize,
  fontWeight: fontStyles.labelSm.fontWeight,
  color: colors.gray600,
})

export const recentDetail = style({
  ...textBase,
  fontSize: fontStyles.labelSm.fontSize,
  fontWeight: fontStyles.labelSm.fontWeight,
  color: colors.gray700,
  whiteSpace: 'pre-wrap',
  wordBreak: 'keep-all',
})

const stateChipBase = style({
  ...textBase,
  flexShrink: 0,
  padding: '3px 8px',
  borderRadius: '6px',
  fontSize: fontStyles.labelSm.fontSize,
  fontWeight: 600,
})

export const stateChip = styleVariants({
  plain: [stateChipBase, { backgroundColor: colors.gray50, color: colors.gray700 }],
  warn: [stateChipBase, { backgroundColor: colors.warning50, color: colors.gray900 }],
  done: [stateChipBase, { backgroundColor: colors.success50, color: colors.success500 }],
})

// ---- 결과·막힘 ----

export const centerStack = style({
  marginTop: '56px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
  textAlign: 'center',
})

export const stateIcon = style({
  width: '56px',
  height: '56px',
  flexShrink: 0,
})

export const centerTitle = style({
  ...textBase,
  fontSize: fontStyles.headingMd.fontSize,
  fontWeight: fontStyles.headingMd.fontWeight,
  color: colors.gray900,
  wordBreak: 'keep-all',
})

export const retakeList = style({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  padding: '16px',
  borderRadius: '12px',
  border: `1px solid ${colors.warning200}`,
  backgroundColor: colors.warning50,
  textAlign: 'left',
})

export const retakeLine = style({
  ...textBase,
  fontSize: fontStyles.bodyLg.fontSize,
  fontWeight: fontStyles.bodyLg.fontWeight,
  color: colors.gray900,
  wordBreak: 'keep-all',
})

export const spinner = style({
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  border: `4px solid ${colors.primary100}`,
  borderTopColor: colors.primary500,
  animation: `${spin} 0.9s linear infinite`,
})

export const actions = style({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  marginTop: '8px',
})
