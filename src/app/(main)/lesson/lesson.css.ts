import { style, globalStyle } from '@vanilla-extract/css'
import { colors } from '@/styles/tokens/colors'
import { cardGridResponsive } from '@/styles/tokens/grid'
import { media } from '@/styles/tokens/breakpoints'

export const pageStyle = style({
  display: 'flex',
  flexDirection: 'column',
})

export const navButtonStyle = style({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  backgroundColor: colors.gray50,
  borderRadius: 4,
  color: colors.gray500,
  selectors: {
    '&:hover': {
      backgroundColor: colors.gray75,
    },
  },
  '@media': {
    [media.phone]: {
      width: '44px',
      height: '44px',
      justifyContent: 'center',
      borderRadius: '12px',
      flexShrink: 0,
    },
  },
})

export const dateGridStyle = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: '12px',
  '@media': {
    [media.phone]: {
      display: 'flex',
      gap: '6px',
      overflow: 'visible',
    },
  },
})

export const lessonGridStyle = style({
  ...cardGridResponsive,
})

globalStyle(`${lessonGridStyle} > *`, {
  minHeight: '248px',
  '@media': {
    [media.phone]: {
      minHeight: '148px',
    },
  },
})

export const sectionTitleStyle = style({
  margin: '80px 0 20px',
  '@media': {
    [media.phone]: {
      margin: '32px 0 16px',
    },
  },
})

export const weekNavStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  marginTop: '60px',
  marginBottom: '24px',
  '@media': {
    [media.phone]: {
      marginTop: '16px',
      marginBottom: '12px',
      gap: '8px',
    },
  },
})

export const weekLabelStyle = style({
  flex: 1,
  textAlign: 'center',
  minWidth: 0,
  whiteSpace: 'nowrap',
})

export const todayButtonStyle = style({
  flexShrink: 0,
  height: 36,
  padding: '0 12px',
  border: `1px solid ${colors.gray200}`,
  borderRadius: 8,
  backgroundColor: colors.white,
  color: colors.gray700,
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  selectors: {
    '&:hover:not(:disabled)': {
      backgroundColor: colors.gray50,
    },
    '&:disabled': {
      opacity: 0.4,
      cursor: 'default',
    },
  },
  '@media': {
    [media.phone]: {
      height: 44,
      padding: '0 10px',
      borderRadius: 12,
    },
  },
})

globalStyle(`${weekLabelStyle} > *`, {
  '@media': {
    [media.phone]: {
      display: 'block',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      fontSize: '16px',
    },
  },
})
