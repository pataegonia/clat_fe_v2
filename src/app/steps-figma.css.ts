import { style } from '@vanilla-extract/css'
import { colors } from '@/styles/tokens/colors'

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
    '(min-width: 768px)': { padding: '96px 32px 48px' },
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
  '@media': { '(min-width: 768px)': { fontSize: '40px' } },
})

export const stepsIntroLead = style({
  marginTop: '16px',
  fontSize: '16px',
  fontWeight: 500,
  lineHeight: 1.6,
  letterSpacing: '-0.02em',
  color: colors.gray700,
  '@media': { '(min-width: 768px)': { fontSize: '20px', marginTop: '20px' } },
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
  width: '140%',
  maxWidth: '1751px',
  height: 'auto',
  pointerEvents: 'none',
  zIndex: 0,
  opacity: 0.55,
  display: 'none',
  '@media': {
    '(min-width: 768px)': { display: 'block', opacity: 0.85 },
  },
})

export const stepFigmaEllipseLeft = style({
  left: '-40%',
  top: '-12%',
  '@media': {
    '(min-width: 1024px)': { left: '-32%', top: '-8%' },
  },
})

export const stepFigmaEllipseRight = style({
  right: '-40%',
  left: 'auto',
  top: '-12%',
  '@media': {
    '(min-width: 1024px)': { right: '-32%', top: '-10%' },
  },
})

export const stepFigmaInner = style({
  position: 'relative',
  zIndex: 1,
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '32px',
  alignItems: 'center',
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '36px 20px',
  '@media': {
    '(min-width: 768px)': {
      gap: '40px',
      padding: '64px 40px',
      maxWidth: '1320px',
    },
    '(min-width: 1024px)': {
      gridTemplateColumns: '1.05fr 0.95fr',
      gap: '56px',
      padding: '80px 64px',
      minHeight: '85vh',
      maxWidth: '1440px',
    },
  },
})

export const stepFigmaInnerTextLeft = style({
  '@media': {
    '(min-width: 1024px)': {
      gridTemplateColumns: '0.95fr 1.05fr',
    },
  },
})

export const stepFigmaInnerParent = style({
  '@media': {
    '(min-width: 1024px)': {
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
  '@media': { '(min-width: 1024px)': { order: 1 } },
})

export const stepFigmaMediaOrder2 = style({
  '@media': { '(min-width: 1024px)': { order: 2 } },
})

export const stepFigmaCopy = style({
  minWidth: 0,
  order: 1,
})

export const stepFigmaCopyOrder1 = style({
  '@media': { '(min-width: 1024px)': { order: 1 } },
})

export const stepFigmaCopyOrder2 = style({
  '@media': { '(min-width: 1024px)': { order: 2 } },
})

export const stepFigmaMeta = style({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '16px',
  flexWrap: 'wrap',
  '@media': {
    '(min-width: 768px)': { gap: '16px', marginBottom: '20px' },
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
    '(min-width: 768px)': { fontSize: '18px', padding: '4px 12px' },
    '(min-width: 1024px)': { fontSize: '22px' },
  },
})

export const stepFigmaTab = style({
  fontSize: '15px',
  fontWeight: 600,
  color: colors.gray700,
  letterSpacing: '-0.03em',
  '@media': {
    '(min-width: 768px)': { fontSize: '18px' },
    '(min-width: 1024px)': { fontSize: '22px' },
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
    '(min-width: 768px)': { fontSize: '36px' },
    '(min-width: 1024px)': { fontSize: '44px', lineHeight: 1.3 },
  },
})

/** Desktop-only line break for titles that include \\n in content */
export const stepTitleBreak = style({
  display: 'none',
  '@media': {
    '(min-width: 768px)': { display: 'block' },
  },
})

export const stepTitleSoftSpace = style({
  '@media': {
    '(min-width: 768px)': { display: 'none' },
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
    '(min-width: 768px)': { fontSize: '20px', marginTop: '28px', gap: '10px' },
    '(min-width: 1024px)': { fontSize: '24px', marginTop: '32px' },
  },
})

export const stepFigmaStack = style({
  position: 'relative',
  width: '100%',
  maxWidth: '520px',
  margin: '0 auto',
  aspectRatio: '640 / 560',
  '@media': {
    '(min-width: 1024px)': { maxWidth: '640px', margin: 0 },
  },
})

export const stepFigmaStackTop = style({
  position: 'absolute',
  left: '2%',
  top: '0',
  width: '58%',
  height: 'auto',
  borderRadius: '20px',
  boxShadow: '0 8px 28px rgba(0,0,0,0.08)',
  zIndex: 1,
})

export const stepFigmaStackBottom = style({
  position: 'absolute',
  left: '30%',
  top: '26%',
  width: '66%',
  height: 'auto',
  borderRadius: '20px',
  boxShadow: '0 8px 28px rgba(0,0,0,0.1)',
  zIndex: 2,
})

export const stepFigmaSingle = style({
  display: 'block',
  width: '100%',
  height: 'auto',
  maxHeight: 'min(42vh, 420px)',
  objectFit: 'contain',
  borderRadius: '16px',
  boxShadow: '0 8px 28px rgba(0,0,0,0.08)',
  margin: '0 auto',
  '@media': {
    '(min-width: 768px)': { maxHeight: 'min(62vh, 640px)', borderRadius: '20px' },
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
  '@media': {
    '(min-width: 768px)': {
      maxWidth: '720px',
      marginLeft: 'auto',
      marginRight: 0,
      gap: '16px',
    },
    '(min-width: 1024px)': {
      display: 'block',
      aspectRatio: '720 / 760',
      minHeight: '420px',
    },
  },
})

export const stepClusterStart = style({
  gridArea: 'start',
  width: '100%',
  height: 'auto',
  borderRadius: '14px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
  '@media': {
    '(min-width: 1024px)': {
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
  borderRadius: '14px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
  '@media': {
    '(min-width: 1024px)': {
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
    '(min-width: 1024px)': {
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
    '(min-width: 1024px)': {
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
    '(min-width: 768px)': { gap: '16px' },
  },
})

export const stepPairLeft = style({
  width: '46%',
  maxWidth: '360px',
  height: 'auto',
  borderRadius: '20px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
})

export const stepPairRight = style({
  width: '38%',
  maxWidth: '300px',
  height: 'auto',
  borderRadius: '20px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
})

export const stepPairArrow = style({
  fontSize: '24px',
  fontWeight: 600,
  color: colors.primary500,
  flexShrink: 0,
  '@media': { '(min-width: 768px)': { fontSize: '36px' } },
})

export const stepParentPhone = style({
  display: 'block',
  width: '100%',
  maxWidth: '280px',
  height: 'auto',
  margin: '0 auto',
  '@media': {
    '(min-width: 768px)': { maxWidth: '340px' },
    '(min-width: 1024px)': { maxWidth: '380px', margin: 0 },
  },
})

export const stepParentNotes = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  '@media': { '(min-width: 768px)': { gap: '24px' } },
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
    '(min-width: 768px)': { fontSize: '28px' },
    '(min-width: 1024px)': { fontSize: '32px' },
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
    '(min-width: 768px)': { fontSize: '18px' },
    '(min-width: 1024px)': { fontSize: '20px' },
  },
})
