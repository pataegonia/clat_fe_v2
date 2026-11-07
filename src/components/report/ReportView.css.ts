import { globalStyle, style } from '@vanilla-extract/css'
import { colors } from '@/styles/tokens/colors'
import { fontStyles } from '@/styles/tokens/typography'

export const muted = style({
  color: colors.gray500,
  fontSize: fontStyles.bodyMd.fontSize,
})

export const classes = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
})

export const classBlock = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
})

export const className = style({
  margin: 0,
  fontSize: fontStyles.titleSm.fontSize,
  fontWeight: 600,
  color: colors.gray900,
})

export const stats = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: '8px',
  margin: 0,
})

export const stat = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  padding: '10px 12px',
  borderRadius: '10px',
  backgroundColor: colors.gray50,
})

globalStyle(`${stat} dt`, {
  fontSize: fontStyles.labelSm.fontSize,
  color: colors.gray500,
})

globalStyle(`${stat} dd`, {
  margin: 0,
  fontSize: fontStyles.headingSm.fontSize,
  fontWeight: 600,
  color: colors.gray900,
})

export const statNote = style({
  fontSize: fontStyles.labelSm.fontSize,
  color: colors.gray500,
})

export const scores = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '6px 14px',
  margin: 0,
  padding: 0,
  listStyle: 'none',
  fontSize: fontStyles.bodyMd.fontSize,
  color: colors.gray700,
})

export const summary = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  margin: 0,
})

globalStyle(`${summary} dt`, {
  fontSize: fontStyles.titleSm.fontSize,
  fontWeight: 600,
  color: colors.gray700,
})

globalStyle(`${summary} dd`, {
  margin: '2px 0 0',
  fontSize: fontStyles.bodyLg.fontSize,
  lineHeight: '160%',
  color: colors.gray900,
})
