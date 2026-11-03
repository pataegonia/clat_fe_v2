import { style, globalStyle, keyframes } from '@vanilla-extract/css'
import { colors } from '@/styles/tokens/colors'
import { media } from '@/styles/tokens/breakpoints'
import { fontStyles } from '@/styles/tokens/typography'
import { baseCardStyleRule } from '@/styles/tokens/card'

/** 카드 토큰(24) 기준 — spacing 토큰 부재로 섹션 큰 단계만 재사용 */
const spaceCard = baseCardStyleRule.padding as string
const spaceSectionMobile = '56px'
const spaceSectionDesktop = '120px'
const radiusCard = baseCardStyleRule.borderRadius as string

export const page = style({
  overflowX: 'clip',
  maxWidth: '100%',
})

export const container = style({
  width: '100%',
  maxWidth: '1200px',
  margin: '0 auto',
  padding: `0 ${spaceCard}`,
  boxSizing: 'border-box',
  '@media': {
    [media.desktop]: { padding: `0 ${spaceCard}` },
    'screen and (min-width: 1200px)': { padding: '0 40px', maxWidth: '1320px' },
  },
})

export const section = style({
  padding: `${spaceSectionMobile} 0`,
  '@media': { [media.desktop]: { padding: `${spaceSectionDesktop} 0` } },
})

export const sectionTitle = style({
  ...fontStyles.display,
  lineHeight: 1.35,
  letterSpacing: '-0.03em',
  color: colors.gray900,
  textAlign: 'center',
  wordBreak: 'keep-all',
  maxWidth: '40ch',
  margin: '0 auto',
  '@media': { [media.desktop]: { fontSize: '48px', fontWeight: '700' } },
})

export const sectionSubtitle = style({
  ...fontStyles.bodyLg,
  marginTop: spaceCard,
  marginLeft: 'auto',
  marginRight: 'auto',
  lineHeight: 1.55,
  letterSpacing: '-0.03em',
  color: colors.gray500,
  textAlign: 'center',
  wordBreak: 'keep-all',
  maxWidth: '40ch',
  '@media': { [media.desktop]: { ...fontStyles.headingMd, color: colors.gray500, marginTop: spaceCard } },
})

export const sectionClosing = style([
  sectionSubtitle,
  { marginTop: spaceSectionMobile },
])

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
  minHeight: '44px',
  height: '60px',
  '@media': { [media.desktop]: { height: '72px' } },
})

export const headerActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  '@media': { [media.desktop]: { gap: '12px' } },
})

export const logo = style({ height: '32px', width: 'auto', objectFit: 'contain' })

export const navLinks = style({
  display: 'none',
  gap: spaceCard,
  '@media': { [media.desktop]: { display: 'flex' } },
})

export const navLink = style({
  ...fontStyles.titleSm,
  minHeight: '44px',
  display: 'inline-flex',
  alignItems: 'center',
  color: colors.gray700,
  transition: 'color 0.2s',
  selectors: {
    '&:hover': { color: colors.primary500 },
    '&:focus-visible': {
      outline: `2px solid ${colors.primary700}`,
      outlineOffset: '2px',
    },
  },
})

export const ctaButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '44px',
  padding: `12px ${spaceCard}`,
  borderRadius: radiusCard,
  backgroundColor: colors.primary500,
  color: colors.white,
  ...fontStyles.titleSm,
  transition: 'background-color 0.2s, transform 0.2s, opacity 0.2s',
  selectors: {
    '&:hover': {
      backgroundColor: colors.primary600,
    },
    '&:focus-visible': {
      outline: `2px solid ${colors.primary700}`,
      outlineOffset: '2px',
    },
  },
})

export const headerDesktopCta = style({
  display: 'none',
  '@media': { [media.desktop]: { display: 'inline-flex' } },
})

export const ctaButtonLarge = style([
  ctaButton,
  {
    minHeight: '44px',
    padding: `${spaceCard} 40px`,
    ...fontStyles.bodyLg,
    borderRadius: radiusCard,
  },
])

export const ctaButtonGhost = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '44px',
  padding: `${spaceCard} 40px`,
  borderRadius: radiusCard,
  backgroundColor: 'transparent',
  color: colors.gray700,
  ...fontStyles.bodyLg,
  outline: `1px solid ${colors.gray100}`,
  transition: 'background-color 0.2s, color 0.2s, outline-color 0.2s',
  selectors: {
    '&:hover': {
      backgroundColor: colors.white,
      outlineColor: colors.primary500,
      color: colors.primary500,
    },
    '&:focus-visible': {
      outline: `2px solid ${colors.primary700}`,
      outlineOffset: '2px',
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

export const hero = style({
  position: 'relative',
  padding: `${spaceSectionMobile} 0`,
  background: `radial-gradient(ellipse at 50% 0%, ${colors.background} 0%, ${colors.primary100} 55%, ${colors.primary200} 100%)`,
  overflow: 'hidden',
  '@media': { [media.desktop]: { padding: `${spaceSectionDesktop} 0` } },
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
  '@media': { [media.desktop]: { display: 'block' } },
})

export const heroFeatureRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  justifyContent: 'flex-start',
  marginTop: spaceCard,
  '@media': { [media.phone]: { justifyContent: 'center' } },
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
  backgroundColor: colors.white,
  padding: `${spaceCard} 0`,
})

export const trustGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: spaceCard,
  '@media': {
    [media.desktop]: { gridTemplateColumns: 'repeat(4, 1fr)', gap: spaceCard },
  },
})

export const trustItem = style({
  textAlign: 'center',
})

export const trustValue = style({
  ...fontStyles.display,
  letterSpacing: '-0.03em',
  color: colors.primary500,
  '@media': { [media.desktop]: { ...fontStyles.headingLg, color: colors.primary500, fontSize: '36px' } },
})

export const trustLabel = style({
  ...fontStyles.bodyMd,
  marginTop: '6px',
  color: colors.gray600,
  lineHeight: 1.4,
  maxWidth: '40ch',
  marginLeft: 'auto',
  marginRight: 'auto',
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
  borderRadius: radiusCard,
  padding: spaceCard,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  border: `1px solid ${colors.gray100}`,
  transition: 'border-color 0.3s ease, background-color 0.3s ease, transform 0.3s ease',
  selectors: {
    '&:hover': {
      borderColor: colors.primary200,
      backgroundColor: colors.white,
    },
  },
})

export const solutionCard = style({
  backgroundColor: colors.white,
  borderRadius: radiusCard,
  padding: spaceCard,
  textAlign: 'center',
  width: '100%',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  border: `1px solid ${colors.gray75}`,
  transition: 'transform 0.3s ease, opacity 0.3s ease',
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
  minWidth: '44px',
  minHeight: '44px',
  padding: '10px',
  borderRadius: radiusCard,
  '@media': { [media.desktop]: { display: 'none' } },
  selectors: {
    '&:hover': { backgroundColor: colors.gray50 },
    '&:focus-visible': {
      outline: `2px solid ${colors.primary700}`,
      outlineOffset: '2px',
    },
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
  padding: spaceCard,
  borderTop: `1px solid ${colors.gray50}`,
  backgroundColor: colors.white,
  '@media': { [media.desktop]: { display: 'none' } },
})

export const mobileNavLink = style({
  display: 'flex',
  alignItems: 'center',
  minHeight: '44px',
  padding: `12px ${spaceCard}`,
  borderRadius: radiusCard,
  ...fontStyles.bodyLg,
  color: colors.gray700,
  transition: 'background-color 0.2s, color 0.2s',
  selectors: {
    '&:hover': {
      backgroundColor: colors.primary50,
      color: colors.primary500,
    },
    '&:focus-visible': {
      outline: `2px solid ${colors.primary700}`,
      outlineOffset: '2px',
    },
  },
})

globalStyle(`${mobileNav} ${ctaButtonLarge}`, {
  width: '100%',
  minHeight: '44px',
  marginTop: '8px',
})

export const heroScreenshotWrap = style({
  width: '100%',
  backgroundColor: 'transparent',
})

export const heroSlideViewport = style({
  position: 'relative',
  width: '100%',
  overflow: 'visible',
  backgroundColor: 'transparent',
})

export const heroSlide = style({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

/** 사용법 묶음 전체 노출 — 크면 비율만 줄여 맞춤 */
export const heroSlideMedia = style({
  width: '100%',
  maxWidth: '520px',
  maxHeight: 'min(48vh, 420px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto',
  overflow: 'visible',
  '@media': {
    [media.desktop]: {
      maxWidth: '640px',
      maxHeight: 'min(56vh, 520px)',
    },
  },
})

globalStyle(`${heroSlideMedia} > *`, {
  width: '100%',
  maxWidth: '100%',
  maxHeight: 'min(48vh, 420px)',
  minHeight: '0',
  margin: '0 auto',
  '@media': {
    [media.desktop]: {
      maxHeight: 'min(56vh, 520px)',
    },
  },
})

globalStyle(`${heroSlideMedia} img`, {
  maxHeight: 'min(48vh, 420px)',
  width: 'auto',
  height: 'auto',
  objectFit: 'contain',
  '@media': {
    [media.desktop]: {
      maxHeight: 'min(56vh, 520px)',
    },
  },
})

export const heroSlideDots = style({
  display: 'flex',
  justifyContent: 'center',
  gap: '8px',
  paddingTop: '12px',
})

export const heroSlideDot = style({
  width: '44px',
  height: '44px',
  minWidth: '44px',
  minHeight: '44px',
  padding: 0,
  border: 'none',
  borderRadius: '50%',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  position: 'relative',
  selectors: {
    '&::after': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: colors.gray300,
      transform: 'translate(-50%, -50%)',
    },
    '&:focus-visible': {
      outline: `2px solid ${colors.primary400}`,
      outlineOffset: '2px',
    },
  },
})

export const heroSlideDotActive = style([
  heroSlideDot,
  {
    selectors: {
      '&::after': {
        backgroundColor: colors.primary500,
        width: '10px',
        height: '10px',
      },
    },
  },
])

export const heroInner = style({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: spaceCard,
  alignItems: 'center',
  textAlign: 'center',
  '@media': {
    [media.desktop]: {
      gridTemplateColumns: '5fr 7fr',
      gap: spaceSectionMobile,
      textAlign: 'left',
      alignItems: 'center',
    },
  },
})

export const heroCopy = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  minWidth: 0,
  '@media': {
    [media.desktop]: { alignItems: 'flex-start' },
  },
})

export const heroVisual = style({
  width: '100%',
  minWidth: 0,
})

export const heroLogoWrap = style({
  display: 'none',
  '@media': { [media.desktop]: { display: 'block' } },
})

export const heroLogo = style({
  height: '40px',
  width: 'auto',
  marginBottom: spaceCard,
  objectFit: 'contain',
})

export const heroTitle = style({
  ...fontStyles.display,
  lineHeight: 1.28,
  letterSpacing: '-0.045em',
  color: colors.gray900,
  maxWidth: '40ch',
  wordBreak: 'keep-all',
  '@media': {
    [media.desktop]: { fontSize: '48px', fontWeight: '700', letterSpacing: '-0.05em' },
  },
})

export const heroSubtitle = style({
  ...fontStyles.bodyLg,
  marginTop: spaceCard,
  lineHeight: 1.55,
  letterSpacing: '-0.03em',
  color: colors.gray700,
  maxWidth: '40ch',
  wordBreak: 'keep-all',
  '@media': {
    [media.desktop]: { ...fontStyles.headingMd, color: colors.gray700, marginTop: spaceCard },
  },
})

export const heroActions = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  width: '100%',
  maxWidth: '360px',
  marginTop: spaceCard,
  '@media': {
    [media.desktop]: {
      alignItems: 'flex-start',
      width: 'auto',
      maxWidth: 'none',
    },
  },
})

globalStyle(`${heroActions} a`, {
  width: '100%',
  minHeight: '44px',
  '@media': {
    [media.desktop]: { width: 'auto' },
  },
})

export const heroScreenshot = style({
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  borderRadius: radiusCard,
  backgroundColor: 'transparent',
})

export const painGrid = style({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: spaceCard,
  marginTop: spaceSectionMobile,
  '@media': {
    [media.desktop]: {
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: spaceCard,
      marginTop: spaceSectionMobile,
    },
  },
})

export const painImageWrap = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  aspectRatio: '4 / 3',
  marginBottom: spaceCard,
  overflow: 'hidden',
  borderRadius: radiusCard,
  backgroundColor: colors.white,
})

export const painImage = style({
  width: '100%',
  height: '100%',
  objectFit: 'contain',
})

export const painText = style({
  ...fontStyles.headingSm,
  maxWidth: '40ch',
  margin: '0 auto',
  lineHeight: 1.45,
  letterSpacing: '-0.03em',
  color: colors.gray900,
  wordBreak: 'keep-all',
  overflowWrap: 'break-word',
  '@media': {
    [media.desktop]: { ...fontStyles.headingMd, color: colors.gray900, maxWidth: '40ch' },
  },
})

export const aboutSection = style({ backgroundColor: colors.white })

export const aboutHeaderWrap = style({
  paddingBottom: spaceSectionMobile,
  '@media': { [media.desktop]: { paddingBottom: spaceSectionMobile } },
})

export const aboutHeader = style({
  maxWidth: '40ch',
  margin: '0 auto',
  textAlign: 'center',
})

export const aboutBody = style({
  ...fontStyles.bodyLg,
  marginTop: spaceCard,
  lineHeight: 1.7,
  letterSpacing: '-0.03em',
  color: colors.gray700,
  wordBreak: 'keep-all',
  maxWidth: '40ch',
  marginLeft: 'auto',
  marginRight: 'auto',
  '@media': { [media.desktop]: { ...fontStyles.headingSm, color: colors.gray700, marginTop: spaceCard } },
})

export const aboutLayout = style({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: spaceSectionMobile,
  alignItems: 'center',
  '@media': {
    'screen and (min-width: 1024px)': {
      gridTemplateColumns: '5fr 7fr',
      gap: spaceSectionMobile,
      alignItems: 'center',
    },
  },
})

export const aboutIntro = style({
  maxWidth: '40ch',
  '@media': {
    'screen and (min-width: 1024px)': {
      position: 'sticky',
      top: '112px',
      alignSelf: 'center',
    },
  },
})

export const aboutIntroTitle = style({
  ...fontStyles.display,
  lineHeight: 1.35,
  letterSpacing: '-0.03em',
  color: colors.gray900,
  wordBreak: 'keep-all',
  maxWidth: '40ch',
  '@media': { [media.desktop]: { fontSize: '44px', fontWeight: '700' } },
})

export const aboutIntroDesc = style({
  ...fontStyles.headingSm,
  marginTop: spaceCard,
  lineHeight: 1.55,
  letterSpacing: '-0.03em',
  color: colors.gray500,
  wordBreak: 'keep-all',
  maxWidth: '40ch',
  '@media': { [media.desktop]: { ...fontStyles.headingSm, color: colors.gray500, marginTop: spaceCard } },
})

export const aboutValueList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: spaceCard,
})

export const aboutValueCard = style({
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: colors.gray50,
  borderRadius: radiusCard,
  padding: spaceSectionMobile,
  minHeight: '160px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  border: `1px solid ${colors.gray100}`,
  transition: 'transform 0.3s ease, opacity 0.3s ease',
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
  maxWidth: '40ch',
  '@media': { [media.desktop]: { maxWidth: '58%' } },
})

export const aboutValueTitle = style({
  ...fontStyles.headingSm,
  lineHeight: 1.35,
  letterSpacing: '-0.03em',
  color: colors.gray700,
  marginBottom: '8px',
  wordBreak: 'keep-all',
  '@media': { [media.desktop]: { ...fontStyles.headingLg, color: colors.gray700, marginBottom: spaceCard } },
})

export const aboutValueDesc = style({
  ...fontStyles.bodyLg,
  lineHeight: 1.45,
  letterSpacing: '-0.04em',
  color: colors.gray700,
  maxWidth: '40ch',
  '@media': { [media.desktop]: { ...fontStyles.headingSm, color: colors.gray700 } },
})

export const aboutValueImage = style({
  display: 'none',
  '@media': {
    [media.desktop]: {
      display: 'block',
      position: 'absolute',
      right: 0,
      top: '50%',
      transform: 'translateY(-50%)',
      width: '40%',
      aspectRatio: '4 / 3',
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
  gap: spaceCard,
  marginTop: spaceSectionMobile,
  '@media': {
    'screen and (min-width: 640px)': { gridTemplateColumns: 'repeat(2, 1fr)', gap: spaceCard },
    'screen and (min-width: 1024px)': {
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: spaceCard,
      marginTop: spaceSectionMobile,
    },
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
  borderRadius: radiusCard,
  padding: spaceCard,
  textAlign: 'center',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '120px',
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
  ...fontStyles.headingSm,
  lineHeight: 1.4,
  letterSpacing: '-0.04em',
  color: colors.gray900,
  marginBottom: '12px',
  wordBreak: 'keep-all',
  maxWidth: '40ch',
  '@media': { [media.desktop]: { ...fontStyles.headingMd, color: colors.gray900 } },
})

export const solutionCardDesc = style({
  ...fontStyles.bodyMd,
  lineHeight: 1.5,
  letterSpacing: '-0.03em',
  color: colors.gray500,
  whiteSpace: 'pre-line',
  wordBreak: 'keep-all',
  overflowWrap: 'break-word',
  maxWidth: '40ch',
  '@media': { [media.desktop]: { ...fontStyles.headingSm, color: colors.gray500 } },
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
  padding: `${spaceSectionMobile} 0`,
  '@media': { [media.desktop]: { padding: `${spaceSectionDesktop} 0` } },
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

export const ctaInner = style({
  position: 'relative',
  zIndex: 1,
  maxWidth: '40ch',
})

export const ctaLogo = style({
  height: '32px',
  width: 'auto',
  marginBottom: spaceCard,
  objectFit: 'contain',
  '@media': { [media.desktop]: { height: '40px', marginBottom: spaceCard } },
})

export const ctaTitle = style({
  ...fontStyles.display,
  lineHeight: 1.35,
  letterSpacing: '-0.03em',
  wordBreak: 'keep-all',
  maxWidth: '40ch',
  '@media': { [media.desktop]: { fontSize: '48px', fontWeight: '700', lineHeight: 1.4 } },
})

export const ctaDesc = style({
  ...fontStyles.bodyLg,
  marginTop: spaceCard,
  lineHeight: 1.6,
  color: colors.gray300,
  wordBreak: 'keep-all',
  maxWidth: '40ch',
  '@media': { [media.desktop]: { ...fontStyles.headingSm, color: colors.gray300, marginTop: spaceCard } },
})

export const ctaActions = style({
  marginTop: spaceCard,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: '12px',
  '@media': {
    [media.desktop]: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: spaceCard,
    },
  },
})

globalStyle(`${ctaActions} a`, {
  width: '100%',
  minHeight: '44px',
  '@media': {
    [media.desktop]: { width: 'auto' },
  },
})

export const footer = style({
  padding: `${spaceCard} 0 calc(108px + env(safe-area-inset-bottom))`,
  backgroundColor: colors.dark,
  borderTop: `1px solid ${colors.gray700}`,
  '@media': { [media.desktop]: { padding: `${spaceCard} 0` } },
})

export const footerText = style({
  ...fontStyles.bodyMd,
  color: colors.gray500,
  textAlign: 'center',
})

export const mobileStickyBar = style({
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 90,
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  padding: `12px ${spaceCard} calc(12px + env(safe-area-inset-bottom))`,
  backgroundColor: colors.white,
  borderTop: `1px solid ${colors.gray75}`,
  '@media': { [media.desktop]: { display: 'none' } },
})

export const mobileStickyText = style({
  ...fontStyles.labelSm,
  margin: 0,
  textAlign: 'center',
  fontWeight: 600,
  color: colors.gray600,
  letterSpacing: '-0.02em',
  maxWidth: '40ch',
  marginLeft: 'auto',
  marginRight: 'auto',
})

export const mobileStickyButton = style([
  ctaButtonLarge,
  {
    width: '100%',
    minHeight: '44px',
    borderRadius: radiusCard,
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
