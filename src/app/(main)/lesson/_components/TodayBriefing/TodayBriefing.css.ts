import { style } from '@vanilla-extract/css'
import { colors } from '@/styles/tokens/colors'
import { fontStyles } from '@/styles/tokens/typography'
import { media } from '@/styles/tokens/breakpoints'

export const card = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  marginTop: '40px',
  padding: '20px 24px',
  borderRadius: '12px',
  border: `1px solid ${colors.gray100}`,
  backgroundColor: colors.gray50,
  '@media': {
    [media.phone]: {
      marginTop: '24px',
      padding: '16px',
    },
  },
})

export const section = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
})

export const classBlock = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
})

export const list = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  margin: 0,
  padding: 0,
  listStyle: 'none',
})

export const todoItem = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'baseline',
  columnGap: '12px',
  rowGap: '4px',
})

export const links = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'baseline',
  gap: '8px',
})

export const link = style({
  fontSize: fontStyles.bodyMd.fontSize,
  fontWeight: 500,
  color: colors.primary500,
  textDecoration: 'none',
  selectors: {
    '&:hover': { textDecoration: 'underline' },
  },
})

export const studentItem = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'baseline',
  columnGap: '12px',
  rowGap: '2px',
})

export const studentName = style({
  minWidth: '56px',
  fontSize: fontStyles.titleSm.fontSize,
  fontWeight: 600,
  color: colors.gray900,
  textDecoration: 'none',
  selectors: {
    '&:hover': { textDecoration: 'underline' },
  },
})
