import { keyframes, style } from '@vanilla-extract/css'
import { colors } from '@/styles/tokens/colors'
import { fontStyles } from '@/styles/tokens/typography'
import { phoneTextRules, truncateRules } from '@/styles/tokens/textOverflow'
import { media } from '@/styles/tokens/breakpoints'

const chartEnter = keyframes({
  '0%': { opacity: 0, transform: 'translateY(10px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
})

export const pageRoot = style({
  width: '100%',
  maxWidth: '1200px',
})

export const headerRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '32px',
  '@media': {
    [media.phone]: {
      marginBottom: '20px',
      minWidth: 0,
    },
  },
})

export const backButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  height: '40px',
  padding: 0,
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  borderRadius: '8px',
  ':hover': {
    background: colors.gray50,
  },
})

export const pageTitle = style({
  fontSize: '28px',
  fontWeight: 700,
  lineHeight: 1.4,
  letterSpacing: '-0.03em',
  color: colors.gray900,
  minWidth: 0,
  '@media': {
    [media.phone]: {
      fontSize: fontStyles.headingLg.fontSize,
      overflowWrap: 'anywhere',
    },
  },
})

export const headerActions = style({
  marginLeft: 'auto',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexShrink: 0,
})

export const parentViewButton = style({
  flexShrink: 0,
  height: '36px',
  padding: '0 14px',
  borderRadius: '999px',
  border: `1px solid ${colors.gray100}`,
  background: colors.white,
  color: colors.gray900,
  fontSize: '14px',
  fontWeight: 600,
  letterSpacing: '-0.02em',
  cursor: 'pointer',
  ':hover': {
    background: colors.gray50,
    borderColor: colors.gray200,
  },
  ':disabled': {
    cursor: 'default',
    color: colors.gray500,
  },
})

export const columns = style({
  display: 'flex',
  gap: '24px',
  alignItems: 'flex-start',
  '@media': {
    [media.phone]: {
      flexDirection: 'column',
    },
  },
})

export const leftCol = style({
  width: '448px',
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  '@media': {
    [media.phone]: {
      width: '100%',
    },
  },
})

export const profileCard = style({
  background: colors.white,
  border: `1px solid ${colors.gray50}`,
  borderRadius: '20px',
  padding: '27px',
  minHeight: '316px',
  '@media': {
    [media.phone]: {
      padding: '20px 16px',
      minHeight: 0,
    },
  },
})

export const profileTop = style({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  marginBottom: '32px',
})

export const avatar = style({
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  background: `linear-gradient(135deg, ${colors.primary300} 0%, ${colors.primary500} 100%)`,
  flexShrink: 0,
})

export const profileName = style([
  {
    fontSize: '24px',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '-0.03em',
    color: colors.gray900,
    minWidth: 0,
    flex: 1,
  },
  truncateRules,
])

export const profileEditButton = style({
  marginLeft: 'auto',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  height: '32px',
  padding: '0 12px',
  borderRadius: '999px',
  border: `1px solid ${colors.gray100}`,
  background: colors.white,
  color: colors.gray700,
  fontSize: fontStyles.bodyMd.fontSize,
  fontWeight: 500,
  lineHeight: 1.4,
  letterSpacing: '-0.02em',
  cursor: 'pointer',
  transition: 'background 0.15s ease, border-color 0.15s ease, color 0.15s ease',
  ':hover': {
    background: colors.gray50,
    borderColor: colors.gray200,
    color: colors.gray900,
  },
})

export const infoGrid = style({
  display: 'grid',
  gridTemplateColumns: '110px 1fr',
  columnGap: '48px',
  rowGap: '12px',
  alignItems: 'center',
})

export const infoLabelCell = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '14px',
  fontWeight: 600,
  lineHeight: 1.4,
  letterSpacing: '-0.03em',
  color: colors.gray500,
})

export const infoValueCell = style([
  {
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: '-0.03em',
    color: colors.gray900,
    minWidth: 0,
  },
  truncateRules,
])

export const infoPhoneValueCell = style([infoValueCell, phoneTextRules])

export const infoParentPhonesValueCell = style([
  infoValueCell,
  {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    whiteSpace: 'normal',
    overflow: 'visible',
    textOverflow: 'clip',
    fontVariantNumeric: 'tabular-nums',
  },
])

export const parentPhoneLine = style({
  display: 'block',
  lineHeight: 1.4,
})

export const statsRow = style({
  display: 'flex',
  gap: '8px',
})

export const statMini = style({
  width: '144px',
  background: colors.gray50,
  borderRadius: '12px',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
})

export const statMiniLabel = style({
  fontSize: '12px',
  fontWeight: 600,
  lineHeight: 1.4,
  letterSpacing: '-0.03em',
  color: colors.gray500,
})

export const statMiniValue = style({
  fontSize: '24px',
  fontWeight: 600,
  lineHeight: 1.4,
  letterSpacing: '-0.03em',
  color: colors.gray700,
  display: 'inline-flex',
  alignItems: 'baseline',
})

export const statMiniValueMax = style({
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: 1.4,
  letterSpacing: '-0.03em',
  color: colors.gray500,
  marginLeft: '2px',
})

export const statTrendRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginTop: '4px',
})

export const statTrendMuted = style({
  fontSize: '12px',
  fontWeight: 500,
  lineHeight: 1.4,
  letterSpacing: '-0.03em',
  color: colors.primary400,
})

export const statTrendDown = style({
  fontSize: '12px',
  fontWeight: 500,
  lineHeight: 1.4,
  letterSpacing: '-0.03em',
  color: colors.error500,
})

export const incompleteCard = style({
  background: colors.white,
  border: `1px solid ${colors.gray50}`,
  borderRadius: '20px',
  padding: '28px',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
})

export const incompleteTitle = style({
  fontSize: '20px',
  fontWeight: 600,
  lineHeight: 1.4,
  letterSpacing: '-0.03em',
  color: colors.gray900,
})

export const incompleteCount = style({
  color: colors.primary500,
})

export const incompleteList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
})

export const incompleteRow = style({
  position: 'relative',
  minHeight: '51px',
  background: colors.gray50,
  borderRadius: '12px',
  padding: '10px 16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  border: 'none',
  width: '100%',
  cursor: 'pointer',
  textAlign: 'left',
  ':hover': {
    filter: 'brightness(0.98)',
  },
})

export const incompleteLeft = style({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  minWidth: 0,
  flex: 1,
})

export const incompleteCheckIcon = style({
  flexShrink: 0,
})

export const incompleteTextBlock = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  minWidth: 0,
})

export const incompleteHomeworkMain = style({
  fontSize: '16px',
  fontWeight: 600,
  lineHeight: 1.4,
  letterSpacing: '-0.03em',
  color: colors.gray900,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

export const incompleteNote = style({
  fontSize: fontStyles.bodyMd.fontSize,
  fontWeight: 500,
  lineHeight: 1.4,
  letterSpacing: '-0.03em',
  color: colors.gray500,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

export const incompleteTagsRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  flexWrap: 'wrap',
  gap: '8px',
  minWidth: 0,
  flex: 1,
})

export const incompleteClassAccent = style({
  display: 'inline-flex',
  alignItems: 'center',
  maxWidth: '100%',
  background: colors.primary100,
  color: colors.primary500,
  fontSize: '12px',
  fontWeight: 600,
  lineHeight: 1.4,
  letterSpacing: '-0.03em',
  padding: '4px 8px',
  borderRadius: '6px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

export const incompleteTemplateAccent = style({
  display: 'inline-flex',
  alignItems: 'center',
  maxWidth: '100%',
  background: colors.success50,
  color: colors.success500,
  fontSize: '12px',
  fontWeight: 600,
  lineHeight: 1.4,
  letterSpacing: '-0.03em',
  padding: '4px 8px',
  borderRadius: '6px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

export const badgeOverdue = style({
  background: colors.error50,
  color: colors.error500,
  fontSize: '12px',
  fontWeight: 600,
  lineHeight: 1.4,
  letterSpacing: '-0.03em',
  padding: '4px 8px',
  borderRadius: '6px',
  flexShrink: 0,
})

export const rightCol = style({
  flex: 1,
  minWidth: 0,
  maxWidth: '636px',
  '@media': {
    [media.phone]: {
      width: '100%',
      maxWidth: '100%',
    },
  },
})

export const panelCard = style({
  background: colors.white,
  border: `1px solid ${colors.gray50}`,
  borderRadius: '20px',
  overflow: 'visible',
  minHeight: '731px',
  display: 'flex',
  flexDirection: 'column',
  '@media': {
    [media.phone]: {
      minHeight: 0,
    },
  },
})

export const tabRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '32px',
  padding: '27px 27px 0',
  borderBottom: `1px solid ${colors.gray50}`,
  position: 'relative',
  '@media': {
    [media.phone]: {
      gap: '16px',
      padding: '16px 16px 0',
      overflowX: 'auto',
    },
  },
})

export const tabBtn = style({
  padding: '0 0 16px',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  fontSize: '20px',
  fontWeight: 600,
  lineHeight: 1.4,
  letterSpacing: '-0.03em',
  color: colors.gray500,
  position: 'relative',
})

export const tabBtnActive = style({
  color: colors.gray900,
  selectors: {
    '&::after': {
      content: '""',
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: '-1px',
      height: '2px',
      background: colors.gray900,
      borderRadius: '1px',
    },
  },
})

export const panelBody = style({
  padding: '20px 27px 27px',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
})

export const periodRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  marginBottom: '20px',
})

export const periodChip = style({
  border: 'none',
  cursor: 'pointer',
  padding: '8px 16px',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: 600,
  lineHeight: 1.4,
  letterSpacing: '-0.03em',
  background: colors.white,
  color: colors.gray500,
})

export const periodChipActive = style({
  background: colors.gray50,
  color: colors.gray700,
})

export const chartWrap = style({
  position: 'relative',
  width: '100%',
  minHeight: '360px',
  marginBottom: '16px',
  overflow: 'visible',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
})

export const chartAxisHint = style({
  fontSize: fontStyles.labelSm.fontSize,
  fontWeight: 500,
  color: colors.gray500,
  letterSpacing: '-0.02em',
  margin: '0 0 4px',
})

export const chartMotion = style({
  animation: `${chartEnter} 0.42s ease-out both`,
})

export const chartSvgArea = style({
  flex: 1,
  minHeight: '260px',
  width: '100%',
})

export const chartTooltip = style({
  position: 'absolute',
  zIndex: 10,
  pointerEvents: 'none',
  minWidth: '180px',
  maxWidth: '260px',
  padding: '10px 12px',
  borderRadius: '10px',
  backgroundColor: colors.white,
  border: `1px solid ${colors.gray100}`,
  boxShadow: '0 4px 16px rgba(54, 55, 68, 0.12)',
  fontSize: '12px',
  fontWeight: 500,
  lineHeight: 1.45,
  letterSpacing: '-0.03em',
  color: colors.gray700,
})

export const chartTooltipTitle = style({
  fontSize: fontStyles.bodyMd.fontSize,
  fontWeight: 600,
  color: colors.gray900,
  marginBottom: '6px',
})

export const chartTooltipRow = style({
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  marginTop: '2px',
})

export const chartTooltipMuted = style({
  color: colors.gray500,
  flexShrink: 0,
})

export const chartLegend = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '12px 16px',
  marginTop: '8px',
  marginBottom: '4px',
})

export const chartLegendItem = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '12px',
  fontWeight: 500,
  color: colors.gray600,
  letterSpacing: '-0.03em',
})

export const chartLegendSwatch = style({
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  flexShrink: 0,
})

export const aiBox = style({
  background: colors.primary50,
  borderRadius: '12px',
  padding: '20px 24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '7px',
  marginTop: 'auto',
})

export const aiTitleRow = style({
  display: 'flex',
  alignItems: 'flex-end',
  gap: '4px',
})

export const aiTitle = style({
  fontSize: '16px',
  fontWeight: 600,
  lineHeight: 1.4,
  letterSpacing: '-0.03em',
  color: colors.primary500,
})

export const aiBody = style({
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: 1.55,
  letterSpacing: '-0.03em',
  color: colors.gray700,
  whiteSpace: 'pre-wrap',
  margin: 0,
})

export const aiSections = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  marginTop: '4px',
})

export const aiSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
})

export const aiSectionTitle = style({
  display: 'inline-flex',
  alignItems: 'center',
  alignSelf: 'flex-start',
  fontSize: '12px',
  fontWeight: 600,
  lineHeight: 1.4,
  letterSpacing: '-0.03em',
  color: colors.primary500,
  background: colors.white,
  border: `1px solid ${colors.primary100}`,
  borderRadius: '999px',
  padding: '4px 10px',
})

export const aiSectionBody = style({
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: 1.55,
  letterSpacing: '-0.03em',
  color: colors.gray700,
  margin: 0,
  whiteSpace: 'pre-wrap',
})

export const aiList = style({
  margin: 0,
  paddingLeft: '18px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  listStyle: 'disc',
})

export const aiListItem = style({
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: 1.55,
  letterSpacing: '-0.03em',
  color: colors.gray700,
})

export const aiToolbar = style({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '8px',
  marginTop: '4px',
})

export const aiRefreshBtn = style({
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 600,
  color: colors.primary400,
  textDecoration: 'underline',
})

export const listTable = style({
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '14px',
})

export const th = style({
  textAlign: 'left',
  padding: '10px 8px',
  color: colors.gray500,
  fontWeight: 600,
  borderBottom: `1px solid ${colors.gray50}`,
})

export const td = style({
  padding: '12px 8px',
  color: colors.gray700,
  fontWeight: 500,
  borderBottom: `1px solid ${colors.gray50}`,
})

export const emptyState = style({
  padding: '48px 16px',
  textAlign: 'center',
  color: colors.gray500,
  fontSize: '14px',
  fontWeight: 500,
})

export const infoIconBtn = style({
  display: 'inline-flex',
  border: 'none',
  background: 'transparent',
  padding: 0,
  marginLeft: '4px',
  cursor: 'default',
  verticalAlign: 'middle',
})

export const memoCard = style({
  background: colors.white,
  border: `1px solid ${colors.gray50}`,
  borderRadius: '20px',
  padding: '20px 24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
})

export const memoTitle = style({
  fontSize: '16px',
  fontWeight: 700,
  color: colors.gray900,
  letterSpacing: '-0.03em',
})

export const memoHint = style({
  fontSize: fontStyles.labelSm.fontSize,
  fontWeight: fontStyles.labelSm.fontWeight,
  lineHeight: '140%',
  letterSpacing: '-0.03em',
  color: colors.gray500,
})

export const memoTextarea = style({
  width: '100%',
  minHeight: '120px',
  resize: 'vertical',
  border: `1px solid ${colors.gray100}`,
  borderRadius: '12px',
  padding: '12px 14px',
  fontSize: '14px',
  lineHeight: 1.5,
  color: colors.gray900,
  outline: 'none',
  fontFamily: 'inherit',
  ':focus': {
    borderColor: colors.primary300,
  },
})

export const alimTableWrap = style({
  width: '100%',
  overflowX: 'auto',
})

export const alimRow = style({
  cursor: 'pointer',
  selectors: {
    '&:hover': {
      backgroundColor: colors.gray50,
    },
  },
})

export const alimRowOpen = style({
  backgroundColor: colors.primary50,
  selectors: {
    '&:hover': {
      backgroundColor: colors.primary50,
    },
  },
})

export const alimDateCell = style({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  whiteSpace: 'nowrap',
})

export const alimChevron = style({
  flexShrink: 0,
  color: colors.gray500,
  display: 'inline-flex',
  transform: 'rotate(-90deg)',
  transition: 'transform 0.2s',
})

export const alimChevronOpen = style({
  transform: 'rotate(0deg)',
})

export const alimBadgeOk = style({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '2px 8px',
  borderRadius: '6px',
  backgroundColor: colors.success50,
  color: colors.success500,
  fontSize: '14px',
  fontWeight: 600,
  whiteSpace: 'nowrap',
})

export const alimBadgeFail = style({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '2px 8px',
  borderRadius: '6px',
  backgroundColor: colors.error50,
  color: colors.error500,
  fontSize: '14px',
  fontWeight: 600,
  whiteSpace: 'nowrap',
})

export const alimBadgePending = style({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '2px 8px',
  borderRadius: '6px',
  backgroundColor: colors.gray50,
  color: colors.gray500,
  fontSize: '14px',
  fontWeight: 600,
  whiteSpace: 'nowrap',
})

export const alimTypeLesson = style({
  display: 'inline-flex',
  padding: '2px 8px',
  borderRadius: '6px',
  border: `1px solid ${colors.primary100}`,
  backgroundColor: colors.primary50,
  color: colors.primary500,
  fontSize: '14px',
  fontWeight: 600,
  whiteSpace: 'nowrap',
})

export const alimTypeAttendance = style({
  display: 'inline-flex',
  padding: '2px 8px',
  borderRadius: '6px',
  border: `1px solid ${colors.gray100}`,
  backgroundColor: colors.gray50,
  color: colors.gray700,
  fontSize: '14px',
  fontWeight: 600,
  whiteSpace: 'nowrap',
})

export const alimTypeBroadcast = style({
  display: 'inline-flex',
  padding: '2px 8px',
  borderRadius: '6px',
  border: `1px solid ${colors.warning200}`,
  backgroundColor: colors.warning50,
  color: colors.gray700,
  fontSize: '14px',
  fontWeight: 600,
  whiteSpace: 'nowrap',
})

export const alimDetailRow = style({
  backgroundColor: colors.background,
})

export const alimDetailInner = style({
  padding: '16px',
})

export const alimDetailCard = style({
  backgroundColor: colors.white,
  border: `1px solid ${colors.gray100}`,
  borderRadius: '12px',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
})

export const alimChannelRow = style({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '8px',
})

export const alimPillOk = style({
  fontSize: '12px',
  fontWeight: 600,
  padding: '2px 8px',
  borderRadius: '4px',
  color: colors.success500,
  backgroundColor: colors.success50,
})

export const alimPillFail = style({
  fontSize: '12px',
  fontWeight: 600,
  padding: '2px 8px',
  borderRadius: '4px',
  color: colors.error500,
  backgroundColor: colors.error50,
})

export const alimPillPending = style({
  fontSize: '12px',
  fontWeight: 600,
  padding: '2px 8px',
  borderRadius: '4px',
  color: colors.gray500,
  backgroundColor: colors.gray50,
})

export const alimPhoneLine = style({
  fontSize: fontStyles.bodyMd.fontSize,
  fontWeight: fontStyles.bodyMd.fontWeight,
  lineHeight: '140%',
  letterSpacing: '-0.03em',
  color: colors.gray500,
})

export const alimMsgBlock = style({
  marginTop: '4px',
  fontSize: fontStyles.bodyMd.fontSize,
  fontWeight: fontStyles.bodyMd.fontWeight,
  color: colors.gray700,
  whiteSpace: 'pre-wrap',
  lineHeight: '140%',
  letterSpacing: '-0.03em',
})

export const alimError = style({
  fontSize: fontStyles.labelSm.fontSize,
  fontWeight: fontStyles.labelSm.fontWeight,
  lineHeight: '140%',
  letterSpacing: '-0.03em',
  color: colors.error500,
})

export const alimParentLink = style({
  alignSelf: 'flex-start',
  marginTop: '4px',
  border: `1px solid ${colors.gray100}`,
  borderRadius: '10px',
  padding: '8px 12px',
  backgroundColor: colors.white,
  color: colors.gray700,
  fontSize: '14px',
  fontWeight: 600,
  fontFamily: 'inherit',
  cursor: 'pointer',
  selectors: {
    '&:hover': {
      borderColor: colors.primary200,
      color: colors.primary600,
    },
  },
})

/* 사진 숙제 동의·제출 링크 카드(memoCard 안) */

export const hwSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  paddingTop: '12px',
  borderTop: `1px solid ${colors.gray50}`,
})

export const hwRowHead = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
})

export const hwRowLabel = style({
  fontSize: '14px',
  fontWeight: 600,
  letterSpacing: '-0.03em',
  color: colors.gray900,
})

export const hwText = style({
  fontSize: '14px',
  lineHeight: 1.5,
  letterSpacing: '-0.02em',
  color: colors.gray700,
  overflowWrap: 'anywhere',
})

export const hwWarn = style({
  fontSize: fontStyles.labelSm.fontSize,
  fontWeight: fontStyles.labelSm.fontWeight,
  lineHeight: '140%',
  letterSpacing: '-0.03em',
  color: colors.error500,
})

export const hwActions = style({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
  gap: '6px',
})

export const hwForm = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  marginTop: '4px',
  padding: '14px',
  borderRadius: '12px',
  backgroundColor: colors.gray50,
})

export const hwField = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
})

export const hwFieldLabel = style({
  fontSize: fontStyles.labelSm.fontSize,
  fontWeight: 600,
  letterSpacing: '-0.03em',
  color: colors.gray700,
})

export const hwChipRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '6px',
})

export const hwChip = style({
  padding: '6px 12px',
  borderRadius: '999px',
  border: `1px solid ${colors.gray100}`,
  backgroundColor: colors.white,
  color: colors.gray700,
  fontSize: '14px',
  fontFamily: 'inherit',
  cursor: 'pointer',
  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${colors.primary400}`,
      outlineOffset: '2px',
    },
  },
})

export const hwChipSelected = style({
  borderColor: colors.primary500,
  backgroundColor: colors.primary50,
  color: colors.primary600,
  fontWeight: 600,
})

export const hwInfoList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
})

export const hwInfoRow = style({
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
})

export const hwInfoLabel = style({
  flexShrink: 0,
  fontSize: '14px',
  letterSpacing: '-0.02em',
  color: colors.gray500,
})

export const hwInfoValue = style({
  fontSize: '14px',
  letterSpacing: '-0.02em',
  color: colors.gray900,
  textAlign: 'right',
  overflowWrap: 'anywhere',
})

export const hwUrlBox = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  padding: '14px',
  borderRadius: '12px',
  backgroundColor: colors.primary50,
})

export const hwUrl = style({
  fontSize: '13px',
  lineHeight: 1.5,
  color: colors.gray900,
  wordBreak: 'break-all',
  userSelect: 'all',
})
