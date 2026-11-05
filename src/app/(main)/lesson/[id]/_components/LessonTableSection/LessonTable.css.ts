import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'
import { colors } from '@/styles/tokens/colors'
import { fontStyles } from '@/styles/tokens/typography'
import { zIndex } from '@/styles/tokens/zIndex'
import { media } from '@/styles/tokens/breakpoints'

export const tableWrapStyle = style({
  overflowX: 'auto',
  border: `1px solid ${colors.gray100}`,
  borderRadius: '8px',
  backgroundColor: colors.white,
  WebkitOverflowScrolling: 'touch',
  overscrollBehaviorX: 'contain',
})

export const tableStyle = style({
  width: '100%',
  tableLayout: 'fixed',
  borderCollapse: 'collapse',
  border: 'none',
  minWidth: '720px',
})

const baseThStyles = {
  height: '40px',
  paddingLeft: '16px',
  backgroundColor: colors.gray50,
  color: colors.gray900,
  fontSize: fontStyles.titleSm.fontSize,
  fontWeight: fontStyles.titleSm.fontWeight,
  letterSpacing: '-0.03em',
  textAlign: 'left' as const,
  borderBottom: `1px solid ${colors.gray100}`,
  borderRight: `1px solid ${colors.gray100}`,
  whiteSpace: 'nowrap' as const,
  selectors: {
    '&:last-child': { borderRight: 'none' as const },
  },
}

const baseTdStyles = {
  height: '40px',
  paddingLeft: '16px',
  backgroundColor: colors.white,
  borderBottom: `1px solid ${colors.gray100}`,
  borderRight: `1px solid ${colors.gray100}`,
  selectors: {
    '&:last-child': { borderRight: 'none' as const },
    'tr:last-child &': { borderBottom: 'none' as const },
  },
}

// 湲곕낯 (硫붾え)
export const thStyle = style({ ...baseThStyles, paddingRight: '16px' })
export const tdStyle = style({ ...baseTdStyles, paddingRight: '16px' })

// ?숈깮, 異쒓껐: 肄섑뀗痢??덈퉬 + paddingRight 36
export const thCompactStyle = style({ ...baseThStyles, paddingRight: '36px' })
export const tdCompactStyle = style({ ...baseTdStyles, paddingRight: '36px' })

// 怨쇱젣, ?ㅻ떟?명듃, ?쒗뿕 ?먯닔: ?ㅻ뜑 肄섑뀗痢?湲곗? ?섏텞
export const thShrinkStyle = style({ ...baseThStyles, paddingRight: '16px' })
export const tdShrinkStyle = style({ ...baseTdStyles, paddingRight: '16px' })

export const cellButtonGroupStyle = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '4px',
})

export const cellButtonRecipe = recipe({
  base: {
    height: '24px',
    width: '44px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: fontStyles.labelSm.fontSize,
    fontWeight: fontStyles.labelSm.fontWeight,
    letterSpacing: '-0.03em',
    lineHeight: '140%',
    transition: 'background-color 0.15s',
    border: 'none',
    '@media': {
      [media.phone]: {
        height: '36px',
        minHeight: '36px',
      },
    },
  },
  variants: {
    variant: {
      default: {
        backgroundColor: colors.gray50,
        color: colors.gray300,
      },
      attend: {
        backgroundColor: colors.success500,
        color: colors.white,
      },
      late: {
        backgroundColor: colors.warning500,
        color: colors.white,
      },
      absent: {
        backgroundColor: colors.error500,
        color: colors.white,
      },
      done: {
        backgroundColor: colors.success500,
        color: colors.white,
      },
      undone: {
        backgroundColor: colors.error500,
        color: colors.white,
      },
      extraOn: {
        backgroundColor: colors.primary500,
        color: colors.white,
      },
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export const extraCellButtonStyle = style({
  width: 'auto',
  minWidth: '44px',
  paddingLeft: '8px',
  paddingRight: '8px',
})

export const cellEditableStyle = style({
  width: '100%',
  fontSize: fontStyles.bodyMd.fontSize,
  fontWeight: fontStyles.bodyMd.fontWeight,
  color: colors.gray700,
  letterSpacing: '-0.03em',
  outline: 'none',
  cursor: 'text',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  selectors: {
    '&:empty::before': {
      content: '"\u2014"',
      color: colors.gray300,
      pointerEvents: 'none',
    },
  },
})

export const studentRowStyle = style({})

export const nameCellRowStyle = style({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  '@media': {
    [media.phone]: {
      display: 'flex',
      width: '100%',
      gap: '4px',
    },
  },
})

export const removeStudentButtonStyle = style({
  position: 'absolute',
  left: '100%',
  marginLeft: '8px',
  top: '50%',
  transform: 'translateY(-50%)',
  display: 'flex',
  alignItems: 'center',
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  color: colors.gray300,
  opacity: 0,
  pointerEvents: 'none',
  selectors: {
    [`${studentRowStyle}:hover &`]: {
      opacity: 1,
      pointerEvents: 'auto',
    },
    '&:hover': {
      color: colors.gray500,
    },
  },
  '@media': {
    [media.phone]: {
      position: 'static',
      left: 'auto',
      top: 'auto',
      marginLeft: 'auto',
      transform: 'none',
      flexShrink: 0,
      width: '32px',
      height: '32px',
      justifyContent: 'center',
      opacity: 1,
      pointerEvents: 'auto',
    },
  },
})

export const nameCellStyle = style({
  display: 'inline-block',
  fontSize: fontStyles.bodyMd.fontSize,
  fontWeight: fontStyles.bodyMd.fontWeight,
  color: colors.gray700,
  letterSpacing: '-0.03em',
  whiteSpace: 'nowrap',
  textDecoration: 'none',
  cursor: 'pointer',
  transition: 'color 0.15s',
  selectors: {
    '&:hover': {
      color: colors.primary500,
    },
  },
})

export const attendanceThStyle = style({
  ...baseThStyles,
  paddingRight: '16px',
  whiteSpace: 'normal',
  verticalAlign: 'top',
})

export const attendanceThInnerStyle = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '8px',
  paddingTop: '8px',
  paddingBottom: '8px',
})

export const attendanceExtraRowStyle = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '6px',
})

export const attendanceExtraChipStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  height: '24px',
  padding: '0 6px 0 8px',
  borderRadius: '4px',
  backgroundColor: colors.primary50,
  color: colors.primary500,
  fontSize: fontStyles.labelSm.fontSize,
  fontWeight: fontStyles.labelSm.fontWeight,
  letterSpacing: '-0.03em',
  lineHeight: '140%',
})

export const attendanceExtraChipRemoveStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '14px',
  height: '14px',
  padding: 0,
  border: 'none',
  borderRadius: '4px',
  background: 'transparent',
  color: colors.primary500,
  cursor: 'pointer',
  selectors: {
    '&:hover': {
      backgroundColor: colors.primary100,
    },
  },
})

export const attendanceExtraInputStyle = style({
  width: '96px',
  height: '24px',
  padding: '0 8px',
  margin: 0,
  border: `1px solid ${colors.gray200}`,
  borderRadius: '6px',
  backgroundColor: colors.white,
  fontSize: fontStyles.labelSm.fontSize,
  fontWeight: fontStyles.labelSm.fontWeight,
  color: colors.gray700,
  letterSpacing: '-0.03em',
  outline: 'none',
  boxSizing: 'border-box',
  selectors: {
    '&::placeholder': {
      color: colors.gray300,
    },
    '&:focus': {
      borderColor: colors.primary300,
      boxShadow: `0 0 0 1px ${colors.primary200}`,
    },
  },
})

export const thInnerStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  whiteSpace: 'nowrap',
})

export const checkboxLabelStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  cursor: 'pointer',
  fontSize: fontStyles.bodyMd.fontSize,
  fontWeight: fontStyles.bodyMd.fontWeight,
  color: colors.gray300,
  letterSpacing: '-0.03em',
})

export const checkboxLabelActiveStyle = style({
  color: colors.primary500,
})

export const activeRowStyle = style({
  backgroundColor: colors.success50,
})

export const activeRowTdStyle = style({
  backgroundColor: colors.success50,
})

export const completeRowTdStyle = style({
  selectors: {
    'td&': {
      backgroundColor: colors.primary50,
    },
  },
})

export const nameStickyCellStyle = style({
  position: 'sticky',
  left: 0,
  zIndex: 2,
  backgroundColor: colors.white,
  boxShadow: `4px 0 8px -6px ${colors.gray200}`,
  selectors: {
    'th&': {
      zIndex: 3,
      backgroundColor: colors.gray50,
    },
    [`&.${activeRowTdStyle}`]: {
      backgroundColor: colors.success50,
    },
    [`&.${completeRowTdStyle}`]: {
      backgroundColor: colors.primary50,
    },
  },
})

export const toolbarStyle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '16px',
  marginBottom: '16px',
})

export const searchBarStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flex: '1 1 auto',
  maxWidth: '360px',
  height: '40px',
  padding: '0 12px',
  backgroundColor: colors.white,
  border: `1px solid ${colors.gray100}`,
  borderRadius: '8px',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  selectors: {
    '&:focus-within': {
      borderColor: colors.primary500,
      boxShadow: `0 0 0 3px ${colors.primary50}`,
    },
  },
})

export const searchLeadingIconStyle = style({
  flexShrink: 0,
  color: colors.gray500,
})

export const searchInputStyle = style({
  flex: 1,
  minWidth: 0,
  height: '100%',
  margin: 0,
  padding: 0,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  fontSize: fontStyles.bodyMd.fontSize,
  fontWeight: fontStyles.bodyMd.fontWeight,
  lineHeight: '140%',
  letterSpacing: '-0.03em',
  color: colors.gray700,
  selectors: {
    '&::placeholder': {
      color: colors.gray300,
    },
    '&::-webkit-search-cancel-button': {
      display: 'none',
    },
  },
})

export const searchClearButtonStyle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  width: '24px',
  height: '24px',
  padding: 0,
  border: 'none',
  borderRadius: '6px',
  background: 'none',
  color: colors.gray300,
  cursor: 'pointer',
  transition: 'color 0.15s, background-color 0.15s',
  selectors: {
    '&:hover': {
      color: colors.gray500,
      backgroundColor: colors.gray50,
    },
  },
})

export const emptyStateStyle = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '40px 16px',
  textAlign: 'center',
  fontSize: fontStyles.bodyMd.fontSize,
  fontWeight: fontStyles.bodyMd.fontWeight,
  color: colors.gray500,
  letterSpacing: '-0.03em',
  backgroundColor: colors.background,
  border: `1px solid ${colors.gray100}`,
  borderRadius: '8px',
})

export const emptyStateIconStyle = style({
  color: colors.gray300,
})

/** SCORE column header: title + max score row */
export const scoreColHeaderStyle = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '4px',
  paddingTop: '4px',
  paddingBottom: '4px',
  whiteSpace: 'normal',
  minWidth: '200px',
})

/** COMPLETE column header: title + shared note row */
export const completeColHeaderStyle = style([
  scoreColHeaderStyle,
  {
    minWidth: '280px',
  },
])

export const scoreHeaderMaxRowStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  marginTop: '2px',
  flexWrap: 'nowrap',
  whiteSpace: 'nowrap',
})

export const scoreHeaderMaxLabelStyle = style({
  fontSize: fontStyles.labelSm.fontSize,
  fontWeight: fontStyles.titleSm.fontWeight,
  color: colors.gray900,
  flexShrink: 0,
})

export const scoreHeaderMaxSuffixStyle = style({
  fontSize: fontStyles.labelSm.fontSize,
  fontWeight: fontStyles.labelSm.fontWeight,
  color: colors.gray500,
  flexShrink: 0,
})

export const scoreHeaderAvgDividerStyle = style({
  fontSize: fontStyles.labelSm.fontSize,
  fontWeight: fontStyles.labelSm.fontWeight,
  color: colors.gray300,
  flexShrink: 0,
})

export const scoreHeaderAvgValueStyle = style({
  fontSize: fontStyles.labelSm.fontSize,
  fontWeight: fontStyles.bodyMd.fontWeight,
  color: colors.gray700,
  letterSpacing: '-0.03em',
  lineHeight: '140%',
  whiteSpace: 'nowrap',
})

export const scoreInputStyle = style({
  width: '100%',
  minWidth: '48px',
  height: '24px',
  padding: '0 4px',
  margin: 0,
  border: 'none',
  borderRadius: '6px',
  backgroundColor: colors.gray50,
  fontSize: fontStyles.bodyMd.fontSize,
  fontWeight: fontStyles.bodyMd.fontWeight,
  color: colors.gray700,
  letterSpacing: '-0.03em',
  outline: 'none',
  boxSizing: 'border-box',
  selectors: {
    '&::placeholder': {
      color: colors.gray300,
    },
    '&:focus': {
      backgroundColor: colors.white,
      boxShadow: `0 0 0 1px ${colors.primary200}`,
    },
  },
})

export const cellTextInputStyle = style({
  width: '100%',
  minWidth: '48px',
  height: '24px',
  padding: 0,
  margin: 0,
  border: 'none',
  borderRadius: 0,
  backgroundColor: 'transparent',
  fontSize: fontStyles.bodyMd.fontSize,
  fontWeight: fontStyles.bodyMd.fontWeight,
  color: colors.gray700,
  letterSpacing: '-0.03em',
  outline: 'none',
  boxSizing: 'border-box',
  cursor: 'text',
  selectors: {
    '&::placeholder': {
      color: colors.gray300,
    },
    '&:focus': {
      backgroundColor: 'transparent',
      boxShadow: 'none',
    },
  },
})

export const textCellWrapStyle = style({
  position: 'relative',
  display: 'block',
  width: '100%',
  minWidth: 0,
  minHeight: '24px',
  maxWidth: '100%',
})

export const textCellAreaStyle = style({
  display: 'block',
  width: '100%',
  minHeight: '24px',
  padding: 0,
  margin: 0,
  border: 'none',
  background: 'transparent',
  fontSize: fontStyles.bodyMd.fontSize,
  fontWeight: fontStyles.bodyMd.fontWeight,
  color: colors.gray700,
  letterSpacing: '-0.03em',
  lineHeight: 1.45,
  whiteSpace: 'pre-wrap',
  overflowWrap: 'anywhere',
  wordBreak: 'break-word',
  resize: 'none',
  overflow: 'hidden',
  outline: 'none',
  boxSizing: 'border-box',
  selectors: {
    '&::placeholder': {
      color: colors.gray300,
    },
  },
})

export const scoreInputNarrowStyle = style([
  scoreInputStyle,
  {
    minWidth: '88px',
    width: 'auto',
    flex: '1 1 88px',
    maxWidth: '140px',
  },
])

export const scoreInputMaxStyle = style([
  scoreInputStyle,
  {
    minWidth: '52px',
    width: '52px',
    flexShrink: 0,
    backgroundColor: colors.white,
    border: `1px solid ${colors.gray200}`,
    selectors: {
      '&::placeholder': {
        color: colors.gray300,
      },
      '&:focus': {
        backgroundColor: colors.white,
        borderColor: colors.primary300,
        boxShadow: `0 0 0 1px ${colors.primary200}`,
      },
    },
  },
])

export const completeHeaderNoteInputStyle = style([
  scoreInputStyle,
  {
    minWidth: '200px',
    width: '240px',
    flexShrink: 0,
    padding: '0 8px',
    backgroundColor: colors.white,
    border: `1px solid ${colors.gray200}`,
    selectors: {
      '&::placeholder': {
        color: colors.gray300,
      },
      '&:focus': {
        backgroundColor: colors.white,
        borderColor: colors.primary300,
        boxShadow: `0 0 0 1px ${colors.primary200}`,
      },
    },
  },
])

export const colHeaderWrapStyle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
  width: '100%',
})

export const colHeaderTitleBlockStyle = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '6px',
  minWidth: 0,
})

export const partialTooltipStyle = style({
  position: 'fixed',
  left: 'var(--partial-tooltip-x)',
  top: 'var(--partial-tooltip-y)',
  transform: 'translate(-50%, calc(-100% - 6px))',
  zIndex: zIndex.tooltip,
  width: 'max-content',
  padding: '6px 10px',
  borderRadius: '8px',
  backgroundColor: colors.gray900,
  color: colors.white,
  fontSize: fontStyles.labelSm.fontSize,
  fontWeight: 500,
  lineHeight: 1.45,
  letterSpacing: '-0.03em',
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
})

export const partialChipRecipe = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2px 6px',
    border: 'none',
    borderRadius: '4px',
    fontSize: fontStyles.labelSm.fontSize,
    fontWeight: fontStyles.labelSm.fontWeight,
    lineHeight: '140%',
    letterSpacing: '-0.03em',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'background-color 0.15s, color 0.15s',
  },
  variants: {
    on: {
      true: {
        backgroundColor: colors.primary50,
        color: colors.primary500,
      },
      false: {
        backgroundColor: colors.gray50,
        color: colors.gray500,
        selectors: {
          '&:hover': {
            backgroundColor: colors.gray100,
            color: colors.gray700,
          },
        },
      },
    },
  },
  defaultVariants: {
    on: false,
  },
})

export const itemControlButtonStyle = style({
  flexShrink: 0,
  width: '20px',
  height: '20px',
  padding: 0,
  border: 'none',
  borderRadius: '4px',
  background: 'transparent',
  color: colors.gray300,
  fontSize: '14px',
  lineHeight: 1,
  cursor: 'pointer',
  opacity: 0.45,
  transition: 'opacity 0.15s ease, color 0.15s ease',
  '@media': {
    [media.phone]: {
      opacity: 1,
      width: '32px',
      height: '32px',
    },
  },
  selectors: {
    [`${colHeaderWrapStyle}:hover &`]: {
      opacity: 1,
    },
    '&:hover': {
      color: colors.gray500,
      backgroundColor: colors.gray100,
    },
  },
})

export const addColumnCellStyle = style({
  width: '40px',
  maxWidth: '40px',
  minWidth: '40px',
  padding: 0,
  textAlign: 'center',
  verticalAlign: 'middle',
  borderBottom: `1px solid ${colors.gray100}`,
  borderRight: 'none',
  backgroundColor: colors.gray50,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  selectors: {
    '&:last-child': {
      borderRight: 'none',
    },
  },
})

export const addColumnButtonStyle = style({
  width: '24px',
  height: '24px',
  padding: 0,
  border: 'none',
  borderRadius: '6px',
  background: 'transparent',
  color: colors.gray300,
  fontSize: '18px',
  lineHeight: 1,
  cursor: 'pointer',
  selectors: {
    '&:hover': {
      color: colors.primary500,
      backgroundColor: colors.primary50,
    },
  },
})
