import { keyframes, style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'
import { colors } from '@/styles/tokens/colors'
import { fontStyles } from '@/styles/tokens/typography'
import { media } from '@/styles/tokens/breakpoints'
import { zIndex } from '@/styles/tokens/zIndex'

/** 사진 숙제 옆 창. 틀은 알림톡 보내기 창(AlimtalkSendModal)과 같다. */

const textBase = {
  lineHeight: '140%',
  letterSpacing: '-0.03em',
} as const

const slideIn = keyframes({
  from: { transform: 'translateX(100%)' },
  to: { transform: 'translateX(0)' },
})

const slideOut = keyframes({
  from: { transform: 'translateX(0)' },
  to: { transform: 'translateX(100%)' },
})

// ---- 틀 ----

export const backdrop = style({
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  display: 'flex',
  justifyContent: 'flex-end',
  zIndex: zIndex.modal,
  overscrollBehavior: 'none',
})

export const drawer = style({
  width: 'min(560px, 100vw)',
  height: '100%',
  position: 'relative',
  backgroundColor: colors.gray50,
  boxShadow: '-4px 0 16px rgba(0, 0, 0, 0.1)',
  display: 'flex',
  flexDirection: 'column',
  animation: `${slideIn} 0.3s ease-out`,
})

export const drawerClosing = style({
  animation: `${slideOut} 0.3s ease-in forwards`,
})

export const header = style({
  padding: '20px 24px',
  paddingTop: 'calc(20px + env(safe-area-inset-top, 0px))',
  borderBottom: `1px solid ${colors.gray100}`,
  backgroundColor: colors.white,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexShrink: 0,
  gap: '16px',
  '@media': {
    [media.phone]: {
      paddingLeft: '16px',
      paddingRight: '16px',
      paddingBottom: '16px',
    },
  },
})

export const closeButton = style({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: colors.gray500,
  display: 'flex',
  alignItems: 'center',
})

export const body = style({
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  overscrollBehavior: 'contain',
  padding: '16px 24px 24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  '@media': {
    [media.phone]: {
      padding: '12px 12px calc(16px + env(safe-area-inset-bottom, 0px))',
    },
  },
})

export const panelNotice = style({
  ...textBase,
  padding: '12px 16px',
  borderRadius: '12px',
  backgroundColor: colors.warning50,
  border: `1px solid ${colors.warning200}`,
  fontSize: fontStyles.bodyMd.fontSize,
  fontWeight: fontStyles.bodyMd.fontWeight,
  color: colors.gray900,
})

export const empty = style({
  ...textBase,
  padding: '40px 16px',
  textAlign: 'center',
  fontSize: fontStyles.bodyMd.fontSize,
  fontWeight: fontStyles.bodyMd.fontWeight,
  color: colors.gray500,
})

// ---- 제출 한 건 ----

export const card = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  padding: '16px',
  borderRadius: '12px',
  backgroundColor: colors.white,
  border: `1px solid ${colors.gray100}`,
  '@media': {
    [media.phone]: {
      padding: '12px',
    },
  },
})

/** 확인 필요 가운데 가장 늦게 낸 것 */
export const cardLatest = style({
  borderColor: colors.primary300,
})

export const cardHead = style({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '8px',
})

export const cardTitleBlock = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  minWidth: 0,
})

export const cardTitle = style({
  ...textBase,
  fontSize: fontStyles.titleSm.fontSize,
  fontWeight: fontStyles.titleSm.fontWeight,
  color: colors.gray900,
  overflowWrap: 'anywhere',
})

export const cardMeta = style({
  ...textBase,
  fontSize: fontStyles.labelSm.fontSize,
  fontWeight: fontStyles.labelSm.fontWeight,
  color: colors.gray500,
})

export const chipRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
  gap: '4px',
  flexShrink: 0,
})

export const chipRecipe = recipe({
  base: {
    ...textBase,
    display: 'inline-flex',
    alignItems: 'center',
    height: '22px',
    padding: '0 8px',
    borderRadius: '4px',
    fontSize: fontStyles.labelSm.fontSize,
    fontWeight: fontStyles.titleSm.fontWeight,
    whiteSpace: 'nowrap',
  },
  variants: {
    tone: {
      suggest: { backgroundColor: colors.primary50, color: colors.primary500 },
      checking: { backgroundColor: colors.primary50, color: colors.primary500 },
      review: {
        backgroundColor: colors.warning50,
        color: colors.gray900,
        boxShadow: `inset 0 0 0 1px ${colors.warning200}`,
      },
      applied: { backgroundColor: colors.success50, color: colors.success500 },
      teacher: { backgroundColor: colors.gray50, color: colors.gray700 },
      ended: { backgroundColor: colors.gray50, color: colors.gray500 },
      hidden: { backgroundColor: colors.gray75, color: colors.gray700 },
    },
  },
  defaultVariants: {
    tone: 'teacher',
  },
})

export const reasonList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
})

export const reasonItem = style({
  ...textBase,
  fontSize: fontStyles.bodyMd.fontSize,
  fontWeight: fontStyles.bodyMd.fontWeight,
  color: colors.gray700,
  overflowWrap: 'anywhere',
  selectors: {
    '&::before': {
      content: '"· "',
      color: colors.gray300,
    },
  },
})

export const cardNotice = style({
  ...textBase,
  padding: '8px 12px',
  borderRadius: '8px',
  backgroundColor: colors.warning50,
  fontSize: fontStyles.labelSm.fontSize,
  fontWeight: fontStyles.labelSm.fontWeight,
  color: colors.gray900,
})

export const actions = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
})

// ---- 사진 ----

export const viewer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
})

export const stage = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '220px',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: colors.dark,
})

export const photo = style({
  maxWidth: '100%',
  maxHeight: '60vh',
  objectFit: 'contain',
})

export const photoBlurred = style({
  filter: 'blur(16px)',
})

export const stageText = style({
  ...textBase,
  padding: '16px',
  fontSize: fontStyles.bodyMd.fontSize,
  fontWeight: fontStyles.bodyMd.fontWeight,
  color: colors.gray100,
  textAlign: 'center',
})

export const reveal = style({
  ...textBase,
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  border: 'none',
  backgroundColor: 'rgba(0, 0, 0, 0.25)',
  color: colors.white,
  fontSize: fontStyles.titleSm.fontSize,
  fontWeight: fontStyles.titleSm.fontWeight,
  cursor: 'pointer',
})

export const revealTag = style({
  padding: '2px 8px',
  borderRadius: '4px',
  backgroundColor: colors.gray900,
  fontSize: fontStyles.labelSm.fontSize,
  fontWeight: fontStyles.labelSm.fontWeight,
})

export const nav = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
})

export const navButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  border: 'none',
  borderRadius: '8px',
  backgroundColor: colors.white,
  boxShadow: `inset 0 0 0 1px ${colors.gray100}`,
  color: colors.gray700,
  cursor: 'pointer',
  selectors: {
    '&:disabled': {
      color: colors.gray200,
      cursor: 'not-allowed',
    },
  },
  '@media': {
    [media.phone]: {
      width: '44px',
      height: '44px',
    },
  },
})

export const navCount = style({
  ...textBase,
  minWidth: '48px',
  textAlign: 'center',
  fontSize: fontStyles.labelSm.fontSize,
  fontWeight: fontStyles.titleSm.fontWeight,
  color: colors.gray700,
})

// ---- 다시 내기 요청·옮기기 창 ----

export const dialogBody = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  marginBottom: '24px',
})

export const field = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
})

export const fieldLabel = style({
  ...textBase,
  fontSize: fontStyles.labelSm.fontSize,
  fontWeight: fontStyles.titleSm.fontWeight,
  color: colors.gray700,
})

export const dateInput = style({
  ...textBase,
  height: '40px',
  padding: '0 12px',
  border: `1px solid ${colors.gray100}`,
  borderRadius: '8px',
  backgroundColor: colors.white,
  fontSize: fontStyles.bodyMd.fontSize,
  fontWeight: fontStyles.bodyMd.fontWeight,
  color: colors.gray700,
  outline: 'none',
  selectors: {
    '&:focus': {
      borderColor: colors.primary500,
    },
  },
})

export const counter = style({
  ...textBase,
  alignSelf: 'flex-end',
  fontSize: fontStyles.labelSm.fontSize,
  fontWeight: fontStyles.labelSm.fontWeight,
  color: colors.gray500,
})

export const dialogActions = style({
  display: 'flex',
  gap: '8px',
})
