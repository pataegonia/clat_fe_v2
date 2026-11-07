import { style, keyframes } from '@vanilla-extract/css'
import { colors } from '@/styles/tokens/colors'
import { fontStyles } from '@/styles/tokens/typography'
import { media } from '@/styles/tokens/breakpoints'
import { zIndex } from '@/styles/tokens/zIndex'
import { truncateRules } from '@/styles/tokens/textOverflow'

const slideIn = keyframes({
  from: { transform: 'translateX(100%)' },
  to: { transform: 'translateX(0)' },
})

const slideOut = keyframes({
  from: { transform: 'translateX(0)' },
  to: { transform: 'translateX(100%)' },
})

const bounceDot = keyframes({
  '0%, 80%, 100%': {
    transform: 'translateY(0) scale(0.85)',
    opacity: 0.45,
  },
  '40%': {
    transform: 'translateY(-6px) scale(1)',
    opacity: 1,
  },
})

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
  width: 'min(960px, 100vw)',
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

export const headerActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexShrink: 0,
})

export const body = style({
  flex: 1,
  display: 'flex',
  minHeight: 0,
  overflow: 'hidden',
})

export const leftCol = style({
  width: '280px',
  flexShrink: 0,
  minWidth: 0,
  borderRight: `1px solid ${colors.gray100}`,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: colors.white,
  minHeight: 0,
  '@media': {
    [media.phone]: {
      width: '156px',
    },
  },
})

export const leftHeader = style({
  padding: '16px 16px 8px',
  '@media': {
    [media.phone]: {
      padding: '12px 10px 8px',
    },
  },
})

export const leftHint = style({
  marginTop: '4px',
  '@media': {
    [media.phone]: {
      display: 'none',
    },
  },
})

export const rightCol = style({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  minHeight: 0,
  padding: '24px',
  overflowY: 'auto',
  overscrollBehavior: 'contain',
  gap: '16px',
  '@media': {
    [media.phone]: {
      padding: '16px 12px',
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

export const selectAllRow = style({
  padding: '12px 16px',
  borderBottom: `1px solid ${colors.gray100}`,
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  '@media': {
    [media.phone]: {
      padding: '10px',
      gap: '8px',
    },
  },
})

export const channelBlock = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  padding: '0 16px 12px',
  borderBottom: `1px solid ${colors.gray100}`,
  '@media': {
    [media.phone]: {
      padding: '0 10px 10px',
    },
  },
})

export const channelRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
})

export const channelCheck = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px 12px',
  borderRadius: '8px',
  backgroundColor: colors.white,
  border: `1px solid ${colors.gray100}`,
  cursor: 'pointer',
  fontSize: fontStyles.titleSm.fontSize,
  fontWeight: fontStyles.titleSm.fontWeight,
  lineHeight: '140%',
  letterSpacing: '-0.03em',
  color: colors.gray700,
  selectors: {
    '&:hover': {
      backgroundColor: colors.primary50,
    },
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.5,
    },
  },
})

export const channelCheckActive = style({
  borderColor: colors.primary200,
  backgroundColor: colors.primary50,
  color: colors.primary500,
})

export const listMessage = style({
  padding: '24px 16px',
})

export const studentRowDisabled = style({
  opacity: 0.45,
  cursor: 'default',
  selectors: {
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
})

export const studentList = style({
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  overscrollBehavior: 'contain',
})

export const studentRow = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '10px',
  padding: '12px 16px',
  borderBottom: `1px solid ${colors.gray50}`,
  cursor: 'pointer',
  selectors: {
    '&:hover': {
      backgroundColor: colors.gray50,
    },
  },
  '@media': {
    [media.phone]: {
      gap: '8px',
      padding: '10px',
    },
  },
})

export const studentRowFocused = style({
  backgroundColor: colors.primary50,
  selectors: {
    '&:hover': {
      backgroundColor: colors.primary100,
    },
  },
})

export const checkbox = style({
  width: '18px',
  height: '18px',
  accentColor: colors.primary500,
  flexShrink: 0,
  marginTop: '2px',
})

export const studentMeta = style({
  flex: 1,
  minWidth: 0,
})

export const studentName = style([
  {
    fontSize: fontStyles.titleSm.fontSize,
    fontWeight: fontStyles.titleSm.fontWeight,
    color: colors.gray900,
    lineHeight: '140%',
    letterSpacing: '-0.03em',
    flex: 1,
    minWidth: 0,
  },
  truncateRules,
])

export const lengthLine = style({
  marginTop: '8px',
})

export const overLimit = style({
  display: 'block',
  margin: '2px 0 0',
})

export const lengthBody = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  marginTop: '44px',
  marginBottom: '36px',
  gap: '4px',
})

export const lengthTitle = style({
  marginBottom: '8px',
})

export const phoneMuted = style({
  fontSize: fontStyles.labelSm.fontSize,
  fontWeight: 500,
  color: colors.gray500,
  marginTop: '4px',
  lineHeight: '140%',
  fontVariantNumeric: 'tabular-nums',
  whiteSpace: 'normal',
  overflowWrap: 'break-word',
})

export const studentNameRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  minWidth: 0,
})

export const previewSectionLabel = style({
  fontSize: fontStyles.titleSm.fontSize,
  fontWeight: 600,
  color: colors.gray700,
  marginBottom: '8px',
})

export const previewBox = style({
  backgroundColor: colors.white,
  padding: '16px',
  borderRadius: '12px',
  color: colors.gray700,
  fontSize: fontStyles.bodyMd.fontSize,
  fontWeight: 500,
  lineHeight: '180%',
  border: `1px solid ${colors.gray100}`,
})

export const footer = style({
  padding: '16px 24px',
  paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
  borderTop: `1px solid ${colors.gray100}`,
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  flexShrink: 0,
  backgroundColor: colors.white,
  '@media': {
    [media.phone]: {
      paddingLeft: '16px',
      paddingRight: '16px',
      flexWrap: 'wrap',
    },
  },
})

export const footerHint = style({
  marginRight: 'auto',
  minWidth: 0,
  paddingRight: '12px',
})

export const schedulePick = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: '8px',
  padding: '12px 24px',
  borderTop: `1px solid ${colors.gray100}`,
  backgroundColor: colors.white,
  flexWrap: 'wrap',
  '@media': {
    [media.phone]: {
      paddingLeft: '16px',
      paddingRight: '16px',
    },
  },
})

export const scheduleInput = style({
  height: '40px',
  padding: '0 12px',
  borderRadius: '8px',
  border: `1px solid ${colors.gray200}`,
  backgroundColor: colors.white,
  color: colors.gray900,
  fontSize: fontStyles.bodyMd.fontSize,
})

export const sendingOverlay = style({
  position: 'absolute',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.28)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 5,
  padding: '24px',
})

export const sendingModal = style({
  minWidth: '280px',
  maxWidth: '420px',
  backgroundColor: colors.white,
  borderRadius: '14px',
  border: `1px solid ${colors.gray100}`,
  boxShadow: '0 16px 40px rgba(15, 23, 42, 0.2)',
  padding: '24px 20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  textAlign: 'center',
})

export const loadingDots = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  marginTop: '2px',
})

export const loadingDot = style({
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: colors.primary500,
  animation: `${bounceDot} 1.2s infinite ease-in-out`,
})

export const loadingDotDelay1 = style({
  animationDelay: '0.15s',
})

export const loadingDotDelay2 = style({
  animationDelay: '0.3s',
})

export const tabRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '24px',
  borderBottom: `1px solid ${colors.gray100}`,
  paddingBottom: '12px',
})

export const tabButton = style({
  background: 'none',
  border: 'none',
  padding: '0 0 10px',
  marginBottom: '-13px',
  cursor: 'pointer',
  borderBottom: '2px solid transparent',
  color: colors.gray500,
  selectors: {
    '&:hover': {
      color: colors.gray700,
    },
  },
})

export const tabButtonActive = style({
  color: colors.gray900,
  borderBottomColor: colors.primary500,
})

export const dashboardFrame = style({
  width: '100%',
  maxWidth: '390px',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
})

export const dashboardHeader = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
  textAlign: 'center',
})

export const dashboardCard = style({
  backgroundColor: colors.white,
  border: `1px solid ${colors.gray50}`,
  borderRadius: '16px',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
})

export const dashboardCardHead = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
})

export const summaryRow = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  gap: '12px',
})

export const feedbackBody = style({
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
})

export const staleBanner = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  padding: '12px 16px',
  borderRadius: '8px',
  backgroundColor: colors.warning50,
  border: `1px solid ${colors.warning200}`,
})

/** 발송 전 규칙 검사 경고 */
export const warningBox = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  margin: '12px 0',
  padding: '12px 16px',
  borderRadius: '8px',
  backgroundColor: colors.warning50,
  border: `1px solid ${colors.warning200}`,
  borderLeft: `3px solid ${colors.warning500}`,
})

export const warningList = style({
  margin: 0,
  paddingLeft: '18px',
  color: colors.gray900,
  fontSize: fontStyles.bodyMd.fontSize,
  lineHeight: '150%',
})

export const warningCount = style({
  display: 'block',
  margin: '2px 0 0',
})

