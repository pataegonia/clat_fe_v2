import { style } from '@vanilla-extract/css'
import { colors } from '@/styles/tokens/colors'
import { fontStyles } from '@/styles/tokens/typography'
import { media } from '@/styles/tokens/breakpoints'

export const layout = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.1fr) minmax(320px, 0.9fr)',
  gap: '24px',
  alignItems: 'start',
  '@media': {
    [media.tablet]: {
      gridTemplateColumns: '1fr',
    },
  },
})

export const panel = style({
  backgroundColor: colors.gray50,
  borderRadius: '16px',
  padding: '32px',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  '@media': {
    [media.phone]: {
      padding: '16px',
    },
  },
})

export const recipientPanel = style({
  minHeight: '640px',
  '@media': {
    [media.phone]: {
      minHeight: 0,
    },
  },
})

export const composeStack = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  minWidth: 0,
})

export const sectionHeader = style({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '12px',
})

export const sectionHeaderText = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
})

export const sectionBlock = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
})

export const searchWrap = style({
  width: '100%',
})

export const typeGrid = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '8px',
  '@media': {
    [media.phone]: {
      gridTemplateColumns: '1fr',
    },
  },
})

export const typeCard = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '4px',
  padding: '14px 16px',
  borderRadius: '8px',
  backgroundColor: colors.white,
  border: `1px solid ${colors.gray100}`,
  cursor: 'pointer',
  textAlign: 'left',
  selectors: {
    '&:hover': {
      backgroundColor: colors.primary50,
    },
  },
})

export const typeCardActive = style({
  backgroundColor: colors.primary50,
  borderColor: colors.primary200,
  selectors: {
    '&:hover': {
      backgroundColor: colors.primary50,
    },
  },
})

export const typeCardTitle = style({
  fontSize: fontStyles.titleSm.fontSize,
  fontWeight: fontStyles.titleSm.fontWeight,
  lineHeight: '140%',
  letterSpacing: '-0.03em',
  color: colors.gray900,
})

export const typeCardTitleActive = style({
  color: colors.primary500,
})

export const typeCardHint = style({
  fontSize: fontStyles.labelSm.fontSize,
  fontWeight: fontStyles.labelSm.fontWeight,
  lineHeight: '140%',
  letterSpacing: '-0.03em',
  color: colors.gray500,
})

export const filterRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  maxHeight: '104px',
  overflowY: 'auto',
})

export const filterChip = style({
  fontSize: fontStyles.titleSm.fontSize,
  fontWeight: fontStyles.titleSm.fontWeight,
  lineHeight: '140%',
  letterSpacing: '-0.03em',
  border: 'none',
  borderRadius: '999px',
  padding: '6px 12px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
})

export const filterChipActive = style({
  backgroundColor: colors.primary500,
  color: colors.white,
})

export const filterChipInactive = style({
  backgroundColor: colors.white,
  color: colors.gray700,
  outline: `1px solid ${colors.gray100}`,
})

export const filterChipCount = style({
  fontSize: fontStyles.labelSm.fontSize,
  fontWeight: fontStyles.labelSm.fontWeight,
  opacity: 0.85,
})

export const toolbar = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
  flexWrap: 'wrap',
})

export const toolbarActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  flexWrap: 'wrap',
})

export const studentList = style({
  flex: 1,
  minHeight: '320px',
  maxHeight: '480px',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  border: `1px solid ${colors.gray100}`,
  borderRadius: '12px',
  backgroundColor: colors.white,
  padding: '8px',
})

export const studentRowButton = style({
  width: '100%',
  border: 'none',
  backgroundColor: 'transparent',
  textAlign: 'left',
})

export const studentRowDisabled = style({
  opacity: 0.4,
  cursor: 'not-allowed',
  selectors: {
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
})

export const studentName = style({
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: fontStyles.titleSm.fontSize,
  fontWeight: fontStyles.titleSm.fontWeight,
  lineHeight: '140%',
  letterSpacing: '-0.03em',
  color: colors.gray900,
})

export const checkBox = style({
  width: '16px',
  height: '16px',
  flexShrink: 0,
  borderRadius: '4px',
  boxSizing: 'border-box',
  border: `1.5px solid ${colors.gray200}`,
  backgroundColor: colors.white,
})

export const checkBoxOn = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '16px',
  height: '16px',
  flexShrink: 0,
  color: colors.primary500,
})

export const studentMeta = style({
  flexShrink: 0,
  maxWidth: '140px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: fontStyles.labelSm.fontSize,
  fontWeight: fontStyles.labelSm.fontWeight,
  lineHeight: '140%',
  letterSpacing: '-0.03em',
  color: colors.gray500,
  textAlign: 'right',
})

export const emptyList = style({
  margin: 'auto',
  padding: '32px 16px',
  textAlign: 'center',
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
  padding: '12px 16px',
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
  },
})

export const channelCheckActive = style({
  borderColor: colors.primary200,
  backgroundColor: colors.primary50,
  color: colors.primary500,
})

export const bodyField = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
})

export const bodyTextarea = style({
  minHeight: '132px',
})

export const studentMetaOver = style({
  flexShrink: 0,
  fontSize: fontStyles.labelSm.fontSize,
  fontWeight: fontStyles.labelSm.fontWeight,
  lineHeight: '140%',
  letterSpacing: '-0.03em',
  color: colors.error500,
  whiteSpace: 'nowrap',
})

export const lengthLine = style({
  margin: '8px 0 0',
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

export const warningActions = style({
  display: 'flex',
  gap: '8px',
})

export const summaryBar = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  flexWrap: 'wrap',
  marginTop: '8px',
})

export const countBadge = style({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 10px',
  borderRadius: '999px',
  backgroundColor: colors.primary100,
  color: colors.primary500,
  fontSize: fontStyles.labelSm.fontSize,
  fontWeight: fontStyles.titleSm.fontWeight,
  lineHeight: '140%',
  letterSpacing: '-0.03em',
  whiteSpace: 'nowrap',
})
