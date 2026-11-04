import { style } from '@vanilla-extract/css'
import { colors } from '@/styles/tokens/colors'
import { media } from '@/styles/tokens/breakpoints'
import { baseCardStyleRule } from '@/styles/tokens/card'

const radiusCard = baseCardStyleRule.borderRadius as string
const mediaWide = 'screen and (min-width: 1024px)'

export const stepsFigmaRoot = style({
  width: '100%',
  backgroundColor: colors.white,
})

export const stepsIntro = style({
  maxWidth: '720px',
  margin: '0 auto',
  padding: '48px 20px 24px',
  textAlign: 'center',
  '@media': {
    [media.desktop]: { padding: '96px 32px 48px' },
  },
})

export const stepsIntroEyebrow = style({
  fontSize: '14px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: colors.primary500,
  marginBottom: '12px',
})

export const stepsIntroTitle = style({
  fontSize: '24px',
  fontWeight: 700,
  lineHeight: 1.35,
  letterSpacing: '-0.03em',
  color: colors.gray900,
  wordBreak: 'keep-all',
  '@media': { [media.desktop]: { fontSize: '40px' } },
})

export const stepsIntroLead = style({
  marginTop: '16px',
  fontSize: '16px',
  fontWeight: 500,
  lineHeight: 1.6,
  letterSpacing: '-0.02em',
  color: colors.gray700,
  '@media': { [media.desktop]: { fontSize: '20px', marginTop: '20px' } },
})

export const stepFigmaSlide = style({
  position: 'relative',
  overflow: 'hidden',
  width: '100%',
})

export const stepFigmaSlideTint = style({
  backgroundColor: colors.primary50,
})

export const stepFigmaSlideWhite = style({
  backgroundColor: colors.white,
})

export const stepFigmaEllipse = style({
  position: 'absolute',
  width: '110%',
  maxWidth: '1400px',
  height: 'auto',
  pointerEvents: 'none',
  zIndex: 0,
  opacity: 0.55,
  display: 'none',
  '@media': {
    [media.desktop]: { display: 'block', opacity: 0.75 },
  },
})

export const stepFigmaEllipseLeft = style({
  left: '-18%',
  top: '-8%',
  '@media': {
    [mediaWide]: { left: '-14%', top: '-6%' },
  },
})

export const stepFigmaEllipseRight = style({
  right: '-18%',
  left: 'auto',
  top: '-8%',
  '@media': {
    [mediaWide]: { right: '-14%', top: '-6%' },
  },
})

export const stepFigmaInner = style({
  position: 'relative',
  zIndex: 1,
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '24px',
  alignItems: 'center',
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '28px 20px',
  boxSizing: 'border-box',
  '@media': {
    [media.desktop]: {
      gap: '32px',
      padding: '40px 40px',
      maxWidth: '1320px',
    },
    [mediaWide]: {
      gridTemplateColumns: '1.05fr 0.95fr',
      gap: '48px',
      padding: '48px 40px',
      maxWidth: '1320px',
    },
  },
})

export const stepFigmaInnerTextLeft = style({
  '@media': {
    [mediaWide]: {
      gridTemplateColumns: '0.95fr 1.05fr',
    },
  },
})

export const stepFigmaInnerParent = style({
  '@media': {
    [mediaWide]: {
      gridTemplateColumns: '0.8fr 1.2fr',
      alignItems: 'start',
    },
  },
})

export const stepFigmaMedia = style({
  position: 'relative',
  width: '100%',
  minWidth: 0,
  order: 2,
})

export const stepFigmaMediaOrder1 = style({
  '@media': { [mediaWide]: { order: 1 } },
})

export const stepFigmaMediaOrder2 = style({
  '@media': { [mediaWide]: { order: 2 } },
})

export const stepFigmaCopy = style({
  minWidth: 0,
  order: 1,
})

export const stepFigmaCopyOrder1 = style({
  '@media': { [mediaWide]: { order: 1 } },
})

export const stepFigmaCopyOrder2 = style({
  '@media': { [mediaWide]: { order: 2 } },
})

export const stepFigmaMeta = style({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '16px',
  flexWrap: 'wrap',
  '@media': {
    [media.desktop]: { gap: '16px', marginBottom: '20px' },
  },
})

export const stepFigmaBadge = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4px 10px',
  backgroundColor: colors.primary500,
  color: colors.white,
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: 700,
  letterSpacing: '-0.03em',
  lineHeight: 1.4,
  '@media': {
    [media.desktop]: { fontSize: '18px', padding: '4px 12px' },
    [mediaWide]: { fontSize: '22px' },
  },
})

export const stepFigmaTab = style({
  fontSize: '15px',
  fontWeight: 600,
  color: colors.gray700,
  letterSpacing: '-0.03em',
  '@media': {
    [media.desktop]: { fontSize: '18px' },
    [mediaWide]: { fontSize: '22px' },
  },
})

export const stepFigmaTitle = style({
  fontSize: '24px',
  fontWeight: 700,
  lineHeight: 1.35,
  letterSpacing: '-0.03em',
  color: colors.gray900,
  wordBreak: 'keep-all',
  overflowWrap: 'break-word',
  '@media': {
    [media.desktop]: { fontSize: '36px' },
    [mediaWide]: { fontSize: '44px', lineHeight: 1.3 },
  },
})

/** Desktop-only line break for titles that include \\n in content */
export const stepTitleBreak = style({
  display: 'none',
  '@media': {
    [media.desktop]: { display: 'block' },
  },
})

export const stepTitleSoftSpace = style({
  '@media': {
    [media.desktop]: { display: 'none' },
  },
})

export const stepFigmaDesc = style({
  marginTop: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  fontSize: '16px',
  fontWeight: 500,
  lineHeight: 1.55,
  letterSpacing: '-0.02em',
  color: colors.gray700,
  wordBreak: 'keep-all',
  '@media': {
    [media.desktop]: { fontSize: '20px', marginTop: '28px', gap: '10px' },
    [mediaWide]: { fontSize: '24px', marginTop: '32px' },
  },
})

export const stepFigmaStack = style({
  position: 'relative',
  width: '100%',
  maxWidth: '520px',
  margin: '0 auto',
  aspectRatio: '640 / 560',
  overflow: 'hidden',
  '@media': {
    [mediaWide]: { maxWidth: '640px', margin: 0 },
  },
})

export const stepFigmaStackTop = style({
  position: 'absolute',
  left: '2%',
  top: '0',
  width: '58%',
  height: 'auto',
  borderRadius: radiusCard,
  boxShadow: '0 8px 28px rgba(0,0,0,0.08)',
  zIndex: 1,
})

export const stepFigmaStackBottom = style({
  position: 'absolute',
  left: '30%',
  top: '26%',
  width: '66%',
  height: 'auto',
  borderRadius: radiusCard,
  boxShadow: '0 8px 28px rgba(0,0,0,0.1)',
  zIndex: 2,
})

export const stepFigmaSingle = style({
  display: 'block',
  width: '100%',
  height: 'auto',
  maxHeight: '420px',
  objectFit: 'contain',
  borderRadius: radiusCard,
  boxShadow: '0 8px 28px rgba(0,0,0,0.08)',
  margin: '0 auto',
  '@media': {
    [media.desktop]: { maxHeight: '560px' },
  },
})

export const stepCluster = style({
  position: 'relative',
  width: '100%',
  maxWidth: '640px',
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gridTemplateAreas: `
    "start detail"
    "phoneA phoneB"
  `,
  gap: '12px',
  alignItems: 'start',
  overflow: 'hidden',
  '@media': {
    [media.desktop]: {
      maxWidth: '720px',
      marginLeft: 'auto',
      marginRight: 0,
      gap: '16px',
    },
    [mediaWide]: {
      display: 'block',
      aspectRatio: '720 / 700',
    },
  },
})

export const stepClusterStart = style({
  gridArea: 'start',
  width: '100%',
  height: 'auto',
  borderRadius: radiusCard,
  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
  '@media': {
    [mediaWide]: {
      position: 'absolute',
      left: '0',
      top: '0',
      width: '48%',
      zIndex: 2,
    },
  },
})

export const stepClusterDetail = style({
  gridArea: 'detail',
  width: '100%',
  height: 'auto',
  borderRadius: radiusCard,
  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
  '@media': {
    [mediaWide]: {
      position: 'absolute',
      right: '0',
      top: '0',
      width: '48%',
      zIndex: 1,
    },
  },
})

export const stepClusterPhoneA = style({
  gridArea: 'phoneA',
  width: '72%',
  maxWidth: '140px',
  height: 'auto',
  justifySelf: 'center',
  '@media': {
    [mediaWide]: {
      position: 'absolute',
      left: '4%',
      bottom: '0',
      width: '24%',
      maxWidth: 'none',
      zIndex: 3,
    },
  },
})

export const stepClusterPhoneB = style({
  gridArea: 'phoneB',
  width: '72%',
  maxWidth: '140px',
  height: 'auto',
  justifySelf: 'center',
  '@media': {
    [mediaWide]: {
      position: 'absolute',
      left: '30%',
      bottom: '0',
      width: '24%',
      maxWidth: 'none',
      zIndex: 3,
    },
  },
})

export const stepPair = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  width: '100%',
  '@media': {
    [media.desktop]: { gap: '16px' },
  },
})

export const stepPairLeft = style({
  width: '46%',
  maxWidth: '360px',
  height: 'auto',
  borderRadius: radiusCard,
  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
})

export const stepPairRight = style({
  width: '38%',
  maxWidth: '300px',
  height: 'auto',
  borderRadius: radiusCard,
  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
})

export const stepPairArrow = style({
  fontSize: '24px',
  fontWeight: 600,
  color: colors.primary500,
  flexShrink: 0,
  '@media': { [media.desktop]: { fontSize: '36px' } },
})

export const stepParentPhone = style({
  display: 'block',
  width: '100%',
  maxWidth: '280px',
  height: 'auto',
  margin: '0 auto',
  '@media': {
    [media.desktop]: { maxWidth: '340px' },
    [mediaWide]: { maxWidth: '380px', margin: 0 },
  },
})

export const stepParentNotes = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  '@media': { [media.desktop]: { gap: '24px' } },
})

export const stepParentNote = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '6px',
  paddingBottom: '18px',
  borderBottom: `1px solid ${colors.gray100}`,
  selectors: {
    '&:last-child': {
      borderBottom: 'none',
      paddingBottom: 0,
    },
  },
})

export const stepParentNoteTitle = style({
  marginTop: '4px',
  fontSize: '22px',
  fontWeight: 700,
  letterSpacing: '-0.03em',
  color: colors.gray900,
  wordBreak: 'keep-all',
  '@media': {
    [media.desktop]: { fontSize: '28px' },
    [mediaWide]: { fontSize: '32px' },
  },
})

export const stepParentNoteDesc = style({
  fontSize: '15px',
  fontWeight: 500,
  lineHeight: 1.55,
  letterSpacing: '-0.02em',
  color: colors.gray700,
  wordBreak: 'keep-all',
  '@media': {
    [media.desktop]: { fontSize: '18px' },
    [mediaWide]: { fontSize: '20px' },
  },
})
