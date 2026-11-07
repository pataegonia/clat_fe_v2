import { style } from '@vanilla-extract/css'
import { colors } from '@/styles/tokens/colors'
import { fontStyles } from '@/styles/tokens/typography'

export const wrapperStyle = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: '8px',
  width: '100%',
  marginTop: '20px',
  textAlign: 'left',
})

export const chipRowStyle = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '6px',
})

export const chipStyle = style({
  padding: '6px 12px',
  borderRadius: '999px',
  border: `1px solid ${colors.gray100}`,
  backgroundColor: colors.white,
  color: colors.gray700,
  fontSize: fontStyles.bodyMd.fontSize,
  cursor: 'pointer',
  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${colors.primary400}`,
      outlineOffset: '2px',
    },
  },
})

export const chipSelectedStyle = style({
  borderColor: colors.primary500,
  backgroundColor: colors.primary50,
  color: colors.primary600,
  fontWeight: 600,
})
