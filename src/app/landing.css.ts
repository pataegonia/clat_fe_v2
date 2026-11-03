import { style, globalStyle, keyframes } from '@vanilla-extract/css'
import { colors } from '@/styles/tokens/colors'

export const page = style({
  overflowX: 'hidden',
})

export const container = style({
  width: '100%',
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 20px',
  '@media': {
    '(min-width: 768px)': { padding: '0 40px' },
    '(min-width: 1200px)': { padding: '0 100px', maxWidth: '1320px' },
  },
})

export const section = style({
  padding: '56px 0',
  '@media': { '(min-width: 768px)': { padding: '120px 0' } },
})

export const sectionTitle = style({
  fontSize: '26px',
  fontWeight: 700,
  lineHeight: 1.35,
  letterSpacing: '-0.03em',
  color: colors.gray900,
  textAlign: 'center',
  wordBreak: 'keep-all',
  '@media': { '(min-width: 768px)': { fontSize: '48px' } },
})

export const sectionSubtitle = style({
  marginTop: '16px',
  fontSize: '16px',
  fontWeight: 500,
  lineHeight: 1.55,
  letterSpacing: '-0.03em',
  color: colors.gray500,
  textAlign: 'center',
  wordBreak: 'keep-all',
  '@media': { '(min-width: 768px)': { fontSize: '28px', marginTop: '20px' } },
})

export const highlight = style({ color: colors.primary500 })

/** Next Image 기본 block 레이아웃 — 비율 왜곡 방지 */
export const responsiveImage = style({
  display: 'block',
  height: 'auto',
  maxWidth: '100%',
})

export const header = style({
  position: 'sticky',
  top: 0,
  zIndex: 100,
  backgroundColor: 'rgba(250, 250, 250, 0.72)',
  backdropFilter: 'blur(16px)',
  borderBottom: '1px solid transparent',
  transition: 'background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
})

export const headerScrolled = style({
  backgroundColor: 'rgba(255, 255, 255, 0.92)',
  borderBottom: `1px solid ${colors.gray50}`,
  boxShadow: '0 4px 24px rgba(59, 81, 204, 0.08)',
})

export const headerInner = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '60px',
  '@media': { '(min-width: 768px)': { height: '72px' } },
})

export const headerActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  '@media': { '(min-width: 768px)': { gap: '12px' } },
})

export const logo = style({ height: '32px', width: 'auto', objectFit: 'contain' })

export const navLinks = style({
  display: 'none',
  gap: '32px',
  '@media': { '(min-width: 768px)': { display: 'flex' } },
})

export const navLink = style({
  fontSize: '15px',
  fontWeight: 600,
  color: colors.gray700,
  transition: 'color 0.2s',
  selectors: { '&:hover': { color: colors.primary500 } },
})

export const ctaButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '12px 24px',
  borderRadius: '999px',
  backgroundColor: colors.primary500,
  color: colors.white,
  fontSize: '14px',
  fontWeight: 600,
  transition: 'background-color 0.2s, box-shadow 0.2s',
  boxShadow: '0 4px 14px rgba(59, 81, 204, 0.25)',
  selectors: {
    '&:hover': {
      backgroundColor: colors.primary600,
      boxShadow: '0 6px 20px rgba(59, 81, 204, 0.35)',
    },
  },
})

export const headerDesktopCta = style({
  display: 'none',
  '@media': { '(min-width: 768px)': { display: 'inline-flex' } },
})

export const ctaButtonLarge = style([
  ctaButton,
  { padding: '16px 40px', fontSize: '16px', borderRadius: '12px' },
])

export const ctaButtonGhost = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px 40px',
  borderRadius: '12px',
  backgroundColor: 'transparent',
  color: colors.gray700,
  fontSize: '16px',
  fontWeight: 600,
  outline: `1px solid ${colors.gray100}`,
  transition: 'all 0.2s',
  selectors: {
    '&:hover': {
      backgroundColor: colors.white,
      outlineColor: colors.primary500,
      color: colors.primary500,
    },
  },
})

const blobFloat = keyframes({
  '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
  '33%': { transform: 'translate(24px, -20px) scale(1.05)' },
  '66%': { transform: 'translate(-16px, 12px) scale(0.97)' },
})

const marqueeScroll = keyframes({
  '0%': { transform: 'translateX(0)' },
  '100%': { transform: 'translateX(-50%)' },
})

const shimmer = keyframes({
  '0%': { backgroundPosition: '200% center' },
  '100%': { backgroundPosition: '-200% center' },
})

const pulseGlow = keyframes({
  '0%, 100%': { opacity: 0.5, transform: 'scale(1)' },
  '50%': { opacity: 0.85, transform: 'scale(1.08)' },
})

export const hero = style({
  position: 'relative',
  padding: '36px 0 48px',
  background: `radial-gradient(ellipse at 50% 0%, ${colors.background} 0%, ${colors.primary100} 55%, ${colors.primary200} 100%)`,
  overflow: 'hidden',
  '@media': { '(min-width: 768px)': { padding: '80px 0 120px' } },
})

export const heroGrid = style({
  position: 'absolute',
  inset: 0,
  backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 81, 204, 0.07) 1px, transparent 0)`,
  backgroundSize: '32px 32px',
  maskImage: 'linear-gradient(to bottom, black 20%, transparent 90%)',
  pointerEvents: 'none',
})

export const heroBlob = style({
  position: 'absolute',
  borderRadius: '50%',
  filter: 'blur(60px)',
  pointerEvents: 'none',
  animation: `${blobFloat} 14s ease-in-out infinite`,
})

export const heroBlob1 = style([
  heroBlob,
  {
    width: '420px',
    height: '420px',
    top: '-120px',
    left: '-80px',
    background: `radial-gradient(circle, ${colors.primary300} 0%, transparent 70%)`,
    opacity: 0.45,
  },
])

export const heroBlob2 = style([
  heroBlob,
  {
    width: '360px',
    height: '360px',
    top: '40px',
    right: '-100px',
    background: `radial-gradient(circle, ${colors.primary400} 0%, transparent 70%)`,
    opacity: 0.3,
    animationDelay: '-4s',
    animationDuration: '18s',
  },
])

export const heroBadge = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 16px',
  marginBottom: '24px',
  borderRadius: '999px',
  backgroundColor: 'rgba(255, 255, 255, 0.75)',
  border: `1px solid ${colors.primary200}`,
  fontSize: '14px',
  fontWeight: 600,
  color: colors.primary600,
  backdropFilter: 'blur(8px)',
  boxShadow: '0 2px 12px rgba(59, 81, 204, 0.1)',
})

export const heroBadgeDot = style({
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: colors.success500,
  boxShadow: `0 0 0 4px ${colors.success50}`,
  animation: `${pulseGlow} 2s ease-in-out infinite`,
})

export const heroTitleLine = style({
  display: 'block',
})

export const heroTitleAccent = style({
  background: `linear-gradient(135deg, ${colors.primary500} 0%, ${colors.primary700} 100%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
})

export const desktopBreak = style({
  display: 'none',
  '@media': { '(min-width: 768px)': { display: 'block' } },
})

export const heroFeatureRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  justifyContent: 'center',
  marginTop: '20px',
  '@media': { '(min-width: 768px)': { gap: '10px', marginTop: '28px' } },
})

export const heroFeaturePill = style({
  padding: '6px 12px',
  borderRadius: '999px',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  border: `1px solid ${colors.gray75}`,
  fontSize: '12px',
  fontWeight: 600,
  color: colors.gray700,
  backdropFilter: 'blur(6px)',
  '@media': { '(min-width: 768px)': { padding: '8px 14px', fontSize: '13px' } },
})

export const trustBar = style({
  borderTop: `1px solid ${colors.gray75}`,
  borderBottom: `1px solid ${colors.gray75}`,
  backgroundColor: 'rgba(255, 255, 255, 0.6)',
  backdropFilter: 'blur(12px)',
  padding: '28px 0',
})

export const trustGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '24px',
  '@media': {
    '(min-width: 768px)': { gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px' },
  },
})

export const trustItem = style({
  textAlign: 'center',
})

export const trustValue = style({
  fontSize: '28px',
  fontWeight: 700,
  letterSpacing: '-0.03em',
  color: colors.primary500,
  '@media': { '(min-width: 768px)': { fontSize: '36px' } },
})

export const trustLabel = style({
  marginTop: '6px',
  fontSize: '14px',
  fontWeight: 500,
  color: colors.gray600,
  lineHeight: 1.4,
  '@media': { '(min-width: 768px)': { fontSize: '15px' } },
})

export const marqueeSection = style({
  overflow: 'hidden',
  padding: '20px 0',
  backgroundColor: colors.primary50,
  borderTop: `1px solid ${colors.primary100}`,
  borderBottom: `1px solid ${colors.primary100}`,
})

export const marqueeTrack = style({
  display: 'flex',
  width: 'max-content',
  animation: `${marqueeScroll} 32s linear infinite`,
  selectors: {
    '&:hover': { animationPlayState: 'paused' },
  },
})

export const marqueeItem = style({
  flexShrink: 0,
  padding: '0 28px',
  fontSize: '15px',
  fontWeight: 600,
  color: colors.primary600,
  whiteSpace: 'nowrap',
  selectors: {
    '&::before': {
      content: '"•"',
      marginRight: '28px',
      color: colors.primary300,
    },
  },
})

export const painCard = style({
  backgroundColor: colors.gray50,
  borderRadius: '20px',
  padding: '24px 20px 28px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  border: '1px solid transparent',
  transition: 'border-color 0.3s ease, background-color 0.3s ease',
  selectors: {
    '&:hover': {
      borderColor: colors.primary200,
      backgroundColor: colors.white,
    },
  },
  '@media': {
    '(min-width: 768px)': {
      borderRadius: '32px',
      padding: '32px 24px 40px',
      minHeight: '420px',
    },
  },
})

export const solutionCard = style({
  backgroundColor: colors.white,
  borderRadius: '32px',
  padding: '40px 20px 32px',
  textAlign: 'center',
  width: '100%',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  border: '1px solid rgba(255,255,255,0.2)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '@media': { '(min-width: 1024px)': { minHeight: '320px', padding: '48px 16px 36px' } },
})

export const benefitCard = style({
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: colors.gray50,
  borderRadius: '32px',
  padding: '32px 28px',
  minHeight: '180px',
  border: `1px solid ${colors.gray75}`,
  transition: 'border-color 0.3s ease, background-color 0.3s ease',
  selectors: {
    '&:hover': {
      borderColor: colors.primary200,
      backgroundColor: colors.white,
    },
  },
})

export const aboutFeatureGrid = style({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '16px',
  marginTop: '48px',
  '@media': {
    '(min-width: 640px)': { gridTemplateColumns: 'repeat(3, 1fr)' },
  },
})

export const aboutFeatureCard = style({
  padding: '24px 20px',
  borderRadius: '20px',
  backgroundColor: colors.primary50,
  border: `1px solid ${colors.primary100}`,
  textAlign: 'center',
})

export const aboutFeatureIcon = style({
  fontSize: '28px',
  marginBottom: '12px',
})

export const aboutFeatureTitle = style({
  fontSize: '16px',
  fontWeight: 700,
  color: colors.gray900,
  marginBottom: '6px',
})

export const aboutFeatureDesc = style({
  fontSize: '14px',
  fontWeight: 500,
  color: colors.gray600,
  lineHeight: 1.5,
})

export const stepConnector = style({
  display: 'none',
  '@media': {
    '(min-width: 1024px)': {
      display: 'block',
      position: 'absolute',
      left: '50%',
      top: 0,
      bottom: 0,
      width: '2px',
      background: `linear-gradient(to bottom, transparent, ${colors.primary200}, transparent)`,
      transform: 'translateX(-50%)',
      opacity: 0.5,
    },
  },
})

export const stepSection = style({
  selectors: {
    '&[data-tinted="true"]': { backgroundColor: colors.primary50 },
    '&[data-tinted="false"]': { backgroundColor: colors.white },
  },
})

export const stepLayout = style({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '40px',
  alignItems: 'center',
  '@media': {
    '(min-width: 1024px)': { gridTemplateColumns: '1fr 1fr', gap: '64px' },
  },
})

export const stepMeta = style({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  marginBottom: '24px',
  flexWrap: 'wrap',
})

export const stepBadge = style({
  display: 'inline-flex',
  padding: '4px 12px',
  backgroundColor: colors.primary500,
  color: colors.white,
  borderRadius: '8px',
  fontSize: '18px',
  fontWeight: 600,
})

export const stepTab = style({ fontSize: '18px', fontWeight: 600, color: colors.gray700 })

export const stepTitle = style({
  fontSize: '32px',
  fontWeight: 700,
  lineHeight: 1.3,
  letterSpacing: '-0.03em',
  color: colors.gray900,
  whiteSpace: 'pre-line',
  '@media': { '(min-width: 768px)': { fontSize: '48px' } },
})

export const stepDescText = style({
  fontSize: '18px',
  fontWeight: 500,
  lineHeight: 1.6,
  color: colors.gray700,
  '@media': { '(min-width: 768px)': { fontSize: '22px' } },
})

export const stepDescList = style({
  marginTop: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
})

export const stepTextCol = style({})

export const stepImages = style({
  position: 'relative',
  width: '100%',
  overflow: 'hidden',
})

export const stepImageSingle = style({
  width: '100%',
  height: 'auto',
  borderRadius: '24px',
  boxShadow: '0 0 20px rgba(0, 0, 0, 0.06)',
  objectFit: 'contain',
})

export const stepImageStack = style({
  position: 'relative',
  width: '100%',
  paddingBottom: '48px',
})

export const stepImageTop = style({
  width: '72%',
  height: 'auto',
  borderRadius: '24px',
  boxShadow: '0 0 20px rgba(0, 0, 0, 0.06)',
  position: 'relative',
  zIndex: 1,
  objectFit: 'contain',
})

export const stepImageBottom = style({
  width: '68%',
  height: 'auto',
  borderRadius: '24px',
  boxShadow: '0 0 20px rgba(0, 0, 0, 0.06)',
  position: 'absolute',
  right: 0,
  bottom: 0,
  zIndex: 2,
  objectFit: 'contain',
})

export const stepImageStackWide = style({
  width: '85%',
  height: 'auto',
  marginLeft: 'auto',
  marginTop: '-24px',
  borderRadius: '12px',
  boxShadow: '0 0 16px rgba(0, 0, 0, 0.08)',
  position: 'relative',
  zIndex: 2,
  objectFit: 'contain',
})

export const stepImageDoubleWrap = style({
  position: 'relative',
  width: '100%',
  paddingBottom: '32px',
})

export const stepImageDoubleMain = style({
  width: '100%',
  height: 'auto',
  borderRadius: '16px',
  boxShadow: '0 0 20px rgba(0, 0, 0, 0.06)',
  objectFit: 'contain',
})

export const stepImageDoubleOverlay = style({
  width: '48%',
  height: 'auto',
  borderRadius: '16px',
  boxShadow: '0 0 20px rgba(0, 0, 0, 0.08)',
  position: 'absolute',
  right: 0,
  bottom: 0,
  objectFit: 'contain',
  '@media': { '(min-width: 768px)': { width: '42%', right: '-12px', bottom: '-24px' } },
})

export const ctaShimmerButton = style([
  ctaButtonLarge,
  {
    background: `linear-gradient(90deg, ${colors.primary500}, ${colors.primary400}, ${colors.primary600}, ${colors.primary500})`,
    backgroundSize: '200% auto',
    animation: `${shimmer} 4s linear infinite`,
    boxShadow: '0 8px 32px rgba(59, 81, 204, 0.4)',
  },
])

export const mobileMenuButton = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: '5px',
  width: '44px',
  height: '44px',
  padding: '10px',
  borderRadius: '10px',
  '@media': { '(min-width: 768px)': { display: 'none' } },
  selectors: {
    '&:hover': { backgroundColor: colors.gray50 },
  },
})

export const mobileMenuLine = style({
  display: 'block',
  width: '100%',
  height: '2px',
  backgroundColor: colors.gray900,
  borderRadius: '2px',
  transition: 'transform 0.3s ease, opacity 0.3s ease',
})

export const mobileNav = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  padding: '16px 24px 24px',
  borderTop: `1px solid ${colors.gray50}`,
  backgroundColor: colors.white,
  '@media': { '(min-width: 768px)': { display: 'none' } },
})

export const mobileNavLink = style({
  display: 'flex',
  alignItems: 'center',
  minHeight: '48px',
  padding: '12px 16px',
  borderRadius: '12px',
  fontSize: '16px',
  fontWeight: 600,
  color: colors.gray700,
  transition: 'background-color 0.2s, color 0.2s',
  selectors: {
    '&:hover': {
      backgroundColor: colors.primary50,
      color: colors.primary500,
    },
  },
})

globalStyle(`${mobileNav} ${ctaButtonLarge}`, {
  width: '100%',
  minHeight: '52px',
  marginTop: '8px',
})

export const heroScreenshotWrap = style({
  marginTop: '32px',
  width: '100%',
  maxWidth: '1100px',
  padding: '8px',
  backgroundColor: colors.gray900,
  borderRadius: '16px',
  boxShadow: '0 16px 40px rgba(59, 81, 204, 0.18), 0 0 0 1px rgba(255,255,255,0.06) inset',
  '@media': {
    '(min-width: 768px)': { padding: '20px', borderRadius: '30px', marginTop: '72px' },
  },
})

export const heroInner = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
})

export const heroLogoWrap = style({
  display: 'none',
  '@media': { '(min-width: 768px)': { display: 'block' } },
})

export const heroLogo = style({ height: '40px', width: 'auto', marginBottom: '32px', objectFit: 'contain' })

export const heroTitle = style({
  fontSize: 'clamp(26px, calc((100vw - 56px) / 10), 64px)',
  fontWeight: 700,
  lineHeight: 1.28,
  letterSpacing: '-0.045em',
  color: colors.gray900,
  maxWidth: '900px',
  wordBreak: 'keep-all',
  '@media': { '(min-width: 768px)': { fontSize: '64px', letterSpacing: '-0.05em' } },
})

export const heroSubtitle = style({
  marginTop: '16px',
  fontSize: '16px',
  fontWeight: 500,
  lineHeight: 1.55,
  letterSpacing: '-0.03em',
  color: colors.gray700,
  maxWidth: '520px',
  wordBreak: 'keep-all',
  '@media': { '(min-width: 768px)': { fontSize: '28px', marginTop: '24px', letterSpacing: '-0.04em' } },
})

export const heroActions = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: '10px',
  width: '100%',
  maxWidth: '360px',
  marginTop: '24px',
  '@media': {
    '(min-width: 768px)': {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      width: 'auto',
      maxWidth: 'none',
      marginTop: '40px',
      gap: '12px',
    },
  },
})

globalStyle(`${heroActions} a`, {
  width: '100%',
  minHeight: '52px',
  '@media': {
    '(min-width: 768px)': { width: 'auto', minHeight: 'auto' },
  },
})

export const heroScreenshot = style({
  width: '100%',
  height: 'auto',
  borderRadius: '12px',
  '@media': { '(min-width: 768px)': { borderRadius: '15px' } },
})

export const painGrid = style({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '16px',
  marginTop: '32px',
  '@media': {
    '(min-width: 768px)': { gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', marginTop: '56px' },
  },
})

export const painImageWrap = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  minHeight: '180px',
  marginBottom: '24px',
})

export const painImage = style({
  width: 'auto',
  height: 'auto',
  maxWidth: '100%',
  maxHeight: '220px',
  objectFit: 'contain',
})

export const painText = style({
  maxWidth: '18em',
  margin: '0 auto',
  fontSize: '20px',
  fontWeight: 600,
  lineHeight: 1.45,
  letterSpacing: '-0.03em',
  color: colors.gray900,
  wordBreak: 'keep-all',
  overflowWrap: 'break-word',
  '@media': {
    '(min-width: 768px)': { fontSize: '24px', maxWidth: '11.5em' },
    '(min-width: 1200px)': { fontSize: '26px' },
  },
})

export const aboutSection = style({ backgroundColor: colors.white })

export const aboutHeaderWrap = style({
  paddingBottom: '40px',
  '@media': { '(min-width: 768px)': { paddingBottom: '56px' } },
})

export const aboutHeader = style({
  maxWidth: '720px',
  margin: '0 auto',
  textAlign: 'center',
})

export const aboutBody = style({
  marginTop: '24px',
  fontSize: '17px',
  fontWeight: 500,
  lineHeight: 1.7,
  letterSpacing: '-0.03em',
  color: colors.gray700,
  wordBreak: 'keep-all',
  '@media': { '(min-width: 768px)': { fontSize: '22px', marginTop: '32px' } },
})

export const aboutLayout = style({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '40px',
  alignItems: 'center',
  '@media': {
    '(min-width: 1024px)': {
      gridTemplateColumns: 'minmax(280px, 0.9fr) minmax(0, 1.15fr)',
      gap: '48px 56px',
      alignItems: 'center',
    },
  },
})

export const aboutIntro = style({
  '@media': {
    '(min-width: 1024px)': {
      position: 'sticky',
      top: '112px',
      alignSelf: 'center',
    },
  },
})

export const aboutIntroTitle = style({
  fontSize: '26px',
  fontWeight: 700,
  lineHeight: 1.35,
  letterSpacing: '-0.03em',
  color: colors.gray900,
  wordBreak: 'keep-all',
  '@media': { '(min-width: 768px)': { fontSize: '44px' } },
})

export const aboutIntroDesc = style({
  marginTop: '24px',
  fontSize: '18px',
  fontWeight: 500,
  lineHeight: 1.55,
  letterSpacing: '-0.03em',
  color: colors.gray500,
  wordBreak: 'keep-all',
  '@media': { '(min-width: 768px)': { fontSize: '22px', marginTop: '28px' } },
})

export const aboutValueList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '28px',
  '@media': { '(min-width: 768px)': { gap: '40px' } },
})

export const aboutValueCard = style({
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: colors.gray50,
  borderRadius: '32px',
  padding: '56px 28px 32px',
  minHeight: '160px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '@media': {
    '(min-width: 768px)': {
      minHeight: '180px',
      padding: '64px 40px 36px',
    },
  },
})

export const aboutValueBadge = style({
  position: 'absolute',
  top: 0,
  left: '28px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '120px',
  height: '44px',
  padding: '0 20px',
  backgroundColor: colors.primary500,
  color: colors.white,
  borderRadius: '0 0 28px 28px',
  fontSize: '16px',
  fontWeight: 600,
  letterSpacing: '-0.04em',
  '@media': {
    '(min-width: 768px)': {
      left: '40px',
      minWidth: '140px',
      height: '52px',
      fontSize: '22px',
    },
  },
})

export const aboutValueBody = style({
  position: 'relative',
  zIndex: 1,
  maxWidth: '100%',
  '@media': { '(min-width: 768px)': { maxWidth: '58%' } },
})

export const aboutValueTitle = style({
  fontSize: '22px',
  fontWeight: 700,
  lineHeight: 1.35,
  letterSpacing: '-0.03em',
  color: colors.gray700,
  marginBottom: '8px',
  wordBreak: 'keep-all',
  '@media': { '(min-width: 768px)': { fontSize: '36px', marginBottom: '16px' } },
})

export const aboutValueDesc = style({
  fontSize: '16px',
  fontWeight: 500,
  lineHeight: 1.45,
  letterSpacing: '-0.04em',
  color: colors.gray700,
  '@media': { '(min-width: 768px)': { fontSize: '20px' } },
})

export const aboutValueImage = style({
  display: 'none',
  '@media': {
    '(min-width: 768px)': {
      display: 'block',
      position: 'absolute',
      right: '-8%',
      top: '50%',
      transform: 'translateY(-50%)',
      width: 'auto',
      height: 'auto',
      maxWidth: '46%',
      maxHeight: '140%',
      objectFit: 'contain',
      opacity: 0.2,
      pointerEvents: 'none',
      zIndex: 0,
    },
  },
})

export const solutionSection = style({
  position: 'relative',
  overflow: 'hidden',
  color: colors.white,
})

export const solutionBg = style({ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' })

export const solutionBgImage = style({ width: '100%', height: '100%', objectFit: 'cover' })

export const solutionOverlay = style({
  position: 'absolute',
  inset: 0,
  backgroundColor: colors.primary500,
  opacity: 0.9,
})

export const solutionContent = style({ position: 'relative', zIndex: 1 })

export const solutionTitle = style([
  sectionTitle,
  {
    color: colors.white,
    letterSpacing: '-0.03em',
  },
])

export const solutionGrid = style({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '24px',
  marginTop: '48px',
  '@media': {
    '(min-width: 640px)': { gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' },
    '(min-width: 1024px)': { gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '56px' },
  },
})

export const solutionColumn = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 0,
})

export const painBadge = style({
  backgroundColor: colors.gray900,
  borderRadius: '20px',
  padding: '20px 16px',
  textAlign: 'center',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  '@media': {
    '(min-width: 768px)': { borderRadius: '32px', padding: '28px 20px 24px', minHeight: '160px' },
    '(min-width: 1024px)': { minHeight: '189px' },
  },
})

export const painBadgeLabel = style({
  display: 'inline-block',
  padding: '2px 10px',
  borderRadius: '6px',
  backgroundColor: 'rgba(59, 81, 204, 0.6)',
  fontSize: '14px',
  fontWeight: 600,
  letterSpacing: '-0.04em',
  marginBottom: '16px',
  '@media': { '(min-width: 768px)': { fontSize: '18px' } },
})

export const painBadgeText = style({
  fontSize: '20px',
  fontWeight: 700,
  lineHeight: 1.4,
  letterSpacing: '-0.04em',
  whiteSpace: 'pre-line',
  '@media': { '(min-width: 768px)': { fontSize: '24px' } },
})

export const solutionConnector = style({
  display: 'flex',
  justifyContent: 'center',
  height: '48px',
  width: '100%',
  '@media': { '(min-width: 768px)': { height: '64px' } },
})

export const solutionConnectorLine = style({
  display: 'block',
  width: '5px',
  height: '100%',
  objectFit: 'fill',
})

export const solutionIcon = style({
  width: '88px',
  height: '88px',
  objectFit: 'contain',
  marginBottom: '20px',
  '@media': { '(min-width: 768px)': { width: '110px', height: '110px', marginBottom: '24px' } },
})

export const solutionCardTitle = style({
  fontSize: '20px',
  fontWeight: 700,
  lineHeight: 1.4,
  letterSpacing: '-0.04em',
  color: colors.gray900,
  marginBottom: '12px',
  wordBreak: 'keep-all',
  '@media': { '(min-width: 768px)': { fontSize: '24px' }, '(min-width: 1200px)': { fontSize: '26px' } },
})

export const solutionCardDesc = style({
  fontSize: '15px',
  fontWeight: 500,
  lineHeight: 1.5,
  letterSpacing: '-0.03em',
  color: colors.gray500,
  whiteSpace: 'pre-line',
  wordBreak: 'keep-all',
  overflowWrap: 'break-word',
  '@media': { '(min-width: 768px)': { fontSize: '18px' }, '(min-width: 1200px)': { fontSize: '20px' } },
})

export const benefitsLayout = style({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '48px',
  marginTop: '56px',
  '@media': {
    '(min-width: 1024px)': { gridTemplateColumns: '1fr 1.2fr', alignItems: 'start' },
  },
})

export const benefitsIntroTitle = style({
  fontSize: '32px',
  fontWeight: 700,
  lineHeight: 1.3,
  letterSpacing: '-0.03em',
  color: colors.gray900,
  '@media': { '(min-width: 768px)': { fontSize: '48px' } },
})

export const benefitsIntroDesc = style({
  marginTop: '24px',
  fontSize: '18px',
  fontWeight: 500,
  lineHeight: 1.6,
  color: colors.gray500,
  '@media': { '(min-width: 768px)': { fontSize: '24px' } },
})

export const benefitList = style({ display: 'flex', flexDirection: 'column', gap: '24px' })

export const benefitBadge = style({
  display: 'inline-block',
  padding: '10px 24px',
  backgroundColor: colors.primary500,
  color: colors.white,
  borderRadius: '0 0 28px 28px',
  fontSize: '18px',
  fontWeight: 600,
  margin: '-32px 0 24px -28px',
})

export const benefitTitle = style({
  fontSize: '28px',
  fontWeight: 700,
  color: colors.gray700,
  marginBottom: '12px',
  '@media': { '(min-width: 768px)': { fontSize: '36px' } },
})

export const benefitDesc = style({
  fontSize: '16px',
  fontWeight: 500,
  lineHeight: 1.5,
  color: colors.gray700,
  maxWidth: '420px',
  '@media': { '(min-width: 768px)': { fontSize: '20px' } },
})

export const benefitBgImage = style({
  position: 'absolute',
  right: '-20px',
  top: '50%',
  transform: 'translateY(-50%)',
  width: 'auto',
  height: 'auto',
  maxWidth: '240px',
  maxHeight: '140px',
  objectFit: 'contain',
  opacity: 0.15,
  pointerEvents: 'none',
})

/** 사용법 리뉴얼 — Figma 원스톱 워크플로우 + 8대 기능 */
export const stepsRenewSection = style({
  backgroundColor: colors.white,
})

export const stepsEyebrow = style({
  fontSize: '16px',
  fontWeight: 500,
  lineHeight: 1.5,
  letterSpacing: '0.004em',
  color: colors.gray900,
  textAlign: 'center',
  marginBottom: '16px',
  '@media': { '(min-width: 768px)': { fontSize: '20px', marginBottom: '20px' } },
})

export const stepsMainTitle = style({
  fontSize: '28px',
  fontWeight: 600,
  lineHeight: 1.45,
  letterSpacing: '-0.02em',
  color: colors.gray900,
  textAlign: 'center',
  '@media': { '(min-width: 768px)': { fontSize: '40px' } },
})

export const stepsLead = style({
  marginTop: '16px',
  fontSize: '16px',
  fontWeight: 400,
  lineHeight: 1.6,
  letterSpacing: '-0.03em',
  color: colors.gray900,
  textAlign: 'center',
  '@media': { '(min-width: 768px)': { fontSize: '20px', marginTop: '20px' } },
})

export const stepsBanner = style({
  marginTop: '40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '56px',
  padding: '16px 24px',
  backgroundColor: colors.gray50,
  borderRadius: '20px',
  '@media': { '(min-width: 768px)': { marginTop: '48px', minHeight: '68px' } },
})

export const stepsBannerWide = style({
  marginTop: '48px',
  '@media': { '(min-width: 768px)': { marginTop: '64px' } },
})

export const stepsBannerText = style({
  fontSize: '16px',
  fontWeight: 600,
  lineHeight: 1.45,
  letterSpacing: '-0.02em',
  color: colors.gray900,
  textAlign: 'center',
  '@media': { '(min-width: 768px)': { fontSize: '22px' } },
})

globalStyle(`${stepsBannerText} strong`, {
  fontWeight: 700,
  color: colors.primary500,
})

export const stepsBannerTextStrong = style({
  fontSize: '16px',
  fontWeight: 700,
  lineHeight: 1.45,
  letterSpacing: '-0.02em',
  color: colors.primary500,
  textAlign: 'center',
  '@media': { '(min-width: 768px)': { fontSize: '22px' } },
})

export const workflowRow = style({
  marginTop: '20px',
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px 4px',
  '@media': {
    '(min-width: 1024px)': {
      flexWrap: 'nowrap',
      gap: '8px',
      justifyContent: 'space-between',
    },
  },
})

export const workflowItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
})

export const workflowChip = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '2px',
  padding: '14px 18px',
  backgroundColor: colors.primary100,
  borderRadius: '20px',
  textAlign: 'center',
  minWidth: '140px',
  '@media': {
    '(min-width: 1024px)': {
      minWidth: 0,
      flex: 1,
      padding: '16px 12px',
    },
  },
})

export const workflowKicker = style({
  fontSize: '13px',
  fontWeight: 400,
  lineHeight: 1.45,
  letterSpacing: '-0.02em',
  color: colors.primary500,
  '@media': { '(min-width: 768px)': { fontSize: '14px' } },
})

export const workflowTitle = style({
  fontSize: '15px',
  fontWeight: 600,
  lineHeight: 1.45,
  letterSpacing: '-0.02em',
  color: colors.primary500,
  '@media': { '(min-width: 768px)': { fontSize: '18px' } },
})

export const workflowArrow = style({
  fontSize: '18px',
  fontWeight: 600,
  color: colors.gray700,
  flexShrink: 0,
  '@media': { '(min-width: 768px)': { fontSize: '22px' } },
})

export const featureMapGrid = style({
  marginTop: '24px',
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '28px 12px',
  '@media': {
    '(min-width: 768px)': {
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
      gap: '28px 16px',
    },
    '(min-width: 1200px)': {
      gridTemplateColumns: 'repeat(8, minmax(0, 1fr))',
      gap: '0 12px',
    },
  },
})

export const featureMapCol = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minWidth: 0,
})

export const featureNameChip = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  minHeight: '80px',
  padding: '12px 8px',
  backgroundColor: colors.primary100,
  borderRadius: '16px',
  textAlign: 'center',
  fontSize: '14px',
  fontWeight: 600,
  lineHeight: 1.45,
  letterSpacing: '-0.02em',
  color: colors.primary500,
  selectors: {
    '&[data-accent="true"]': { backgroundColor: colors.primary200 },
  },
  '@media': {
    '(min-width: 768px)': {
      minHeight: '88px',
      borderRadius: '20px',
      fontSize: '15px',
    },
    '(min-width: 1200px)': {
      minHeight: '96px',
      fontSize: '15px',
      padding: '12px 6px',
    },
  },
})

globalStyle(`${featureNameChip} span`, {
  display: 'block',
})

export const featureConnector = style({
  display: 'flex',
  justifyContent: 'center',
  height: '36px',
  width: '100%',
  '@media': { '(min-width: 768px)': { height: '44px' } },
})

export const featureConnectorLine = style({
  display: 'block',
  width: '2px',
  height: '100%',
  objectFit: 'fill',
})

export const featureOutcomeChip = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  minHeight: '80px',
  padding: '12px 8px',
  backgroundColor: colors.primary400,
  borderRadius: '16px',
  textAlign: 'center',
  fontSize: '14px',
  fontWeight: 600,
  lineHeight: 1.45,
  letterSpacing: '-0.02em',
  color: colors.white,
  '@media': {
    '(min-width: 768px)': {
      minHeight: '88px',
      borderRadius: '20px',
      fontSize: '15px',
    },
    '(min-width: 1200px)': {
      minHeight: '96px',
      fontSize: '15px',
      padding: '12px 6px',
    },
  },
})

globalStyle(`${featureOutcomeChip} span`, {
  display: 'block',
})

export const stepsDetailIntro = style({
  marginTop: '72px',
  paddingTop: '48px',
  borderTop: `1px solid ${colors.gray75}`,
})

export const ctaSection = style({
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: colors.dark,
  color: colors.white,
  padding: '72px 0 88px',
  '@media': { '(min-width: 768px)': { padding: '100px 0' } },
})

export const ctaGiftWrap = style({
  position: 'absolute',
  right: '-18%',
  bottom: '8%',
  pointerEvents: 'none',
  opacity: 0.45,
  '@media': { '(min-width: 768px)': { right: '-10%', bottom: '10%', opacity: 1 } },
})

export const ctaGift = style({
  width: 'auto',
  height: 'auto',
  maxWidth: 'min(220px, 48vw)',
  maxHeight: '220px',
  objectFit: 'contain',
  opacity: 0.28,
  '@media': {
    '(min-width: 768px)': { maxWidth: 'min(420px, 55vw)', maxHeight: '420px', opacity: 0.35 },
  },
})

export const ctaInner = style({ position: 'relative', zIndex: 1, maxWidth: '640px' })

export const ctaLogo = style({
  height: '32px',
  width: 'auto',
  marginBottom: '24px',
  objectFit: 'contain',
  '@media': { '(min-width: 768px)': { height: '40px', marginBottom: '48px' } },
})

export const ctaTitle = style({
  fontSize: '28px',
  fontWeight: 700,
  lineHeight: 1.35,
  letterSpacing: '-0.03em',
  wordBreak: 'keep-all',
  '@media': { '(min-width: 768px)': { fontSize: '48px', lineHeight: 1.4 } },
})

export const ctaDesc = style({
  marginTop: '16px',
  fontSize: '16px',
  fontWeight: 500,
  lineHeight: 1.6,
  color: colors.gray300,
  wordBreak: 'keep-all',
  '@media': { '(min-width: 768px)': { fontSize: '22px', marginTop: '24px' } },
})

export const ctaActions = style({
  marginTop: '28px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: '12px',
  '@media': {
    '(min-width: 768px)': {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: '40px',
    },
  },
})

globalStyle(`${ctaActions} a`, {
  width: '100%',
  minHeight: '52px',
  '@media': {
    '(min-width: 768px)': { width: 'auto', minHeight: 'auto' },
  },
})

export const footer = style({
  padding: '28px 0 calc(108px + env(safe-area-inset-bottom))',
  backgroundColor: colors.dark,
  borderTop: '1px solid rgba(255,255,255,0.08)',
  '@media': { '(min-width: 768px)': { padding: '32px 0' } },
})

export const footerText = style({ fontSize: '14px', color: colors.gray500, textAlign: 'center' })

export const mobileStickyBar = style({
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 90,
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  padding: '12px 16px calc(12px + env(safe-area-inset-bottom))',
  backgroundColor: 'rgba(255, 255, 255, 0.96)',
  backdropFilter: 'blur(16px)',
  borderTop: `1px solid ${colors.gray75}`,
  boxShadow: '0 -8px 28px rgba(59, 81, 204, 0.12)',
  '@media': { '(min-width: 768px)': { display: 'none' } },
})

export const mobileStickyText = style({
  margin: 0,
  textAlign: 'center',
  fontSize: '13px',
  fontWeight: 600,
  color: colors.gray600,
  letterSpacing: '-0.02em',
})

export const mobileStickyButton = style([
  ctaButtonLarge,
  {
    width: '100%',
    minHeight: '52px',
    borderRadius: '12px',
  },
])

export const textBlock = style({
  selectors: {
    '&[data-reversed="true"]': {
      '@media': { '(min-width: 1024px)': { order: 2 } },
    },
    '&[data-reversed="false"]': {
      '@media': { '(min-width: 1024px)': { order: 1 } },
    },
  },
})

export const imageBlock = style({
  selectors: {
    '&[data-reversed="true"]': {
      '@media': { '(min-width: 1024px)': { order: 1 } },
    },
    '&[data-reversed="false"]': {
      '@media': { '(min-width: 1024px)': { order: 2 } },
    },
  },
})
