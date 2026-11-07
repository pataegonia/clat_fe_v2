import { style } from '@vanilla-extract/css'
import { colors } from '@/styles/tokens/colors'
import { fontStyles } from '@/styles/tokens/typography'
import { media } from '@/styles/tokens/breakpoints'

export const wrap = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
})

export const header = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
})

export const toggle = style({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  cursor: 'pointer',
})

export const list = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  margin: 0,
  padding: 0,
  listStyle: 'none',
})

export const card = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  padding: '16px 20px',
  borderRadius: '12px',
  border: `1px solid ${colors.gray100}`,
  backgroundColor: colors.gray50,
  '@media': {
    [media.phone]: {
      padding: '14px 16px',
    },
  },
})

export const name = style({
  fontSize: fontStyles.titleMd.fontSize,
  fontWeight: 600,
  color: colors.gray900,
  textDecoration: 'none',
  selectors: {
    '&:hover': { textDecoration: 'underline' },
  },
})

export const signals = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  margin: 0,
  padding: 0,
  listStyle: 'none',
})

export const signal = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
})

export const signalText = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '8px',
})

export const actions = style({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
})
