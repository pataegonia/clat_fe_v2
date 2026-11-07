import { style } from '@vanilla-extract/css'
import { colors } from '@/styles/tokens/colors'
import { fontStyles } from '@/styles/tokens/typography'
import { media } from '@/styles/tokens/breakpoints'

export const page = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
})

export const tabs = style({
  display: 'flex',
  gap: '24px',
  marginTop: '24px',
})

const tabBase = {
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  fontSize: fontStyles.headingMd.fontSize,
  fontWeight: 600,
}

export const tab = style({ ...tabBase, color: colors.gray300 })
export const tabActive = style({ ...tabBase, color: colors.gray900 })

export const toolbar = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '10px',
})

export const select = style({
  height: '36px',
  padding: '0 10px',
  borderRadius: '8px',
  border: `1px solid ${colors.gray200}`,
  backgroundColor: 'white',
  fontSize: fontStyles.bodyMd.fontSize,
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
  gap: '12px',
  padding: '16px 20px',
  borderRadius: '12px',
  border: `1px solid ${colors.gray100}`,
  backgroundColor: 'white',
  '@media': {
    [media.phone]: { padding: '14px 16px' },
  },
})

export const cardHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
})

export const studentName = style({
  fontSize: fontStyles.titleMd.fontSize,
  fontWeight: 600,
  color: colors.gray900,
  textDecoration: 'none',
  selectors: { '&:hover': { textDecoration: 'underline' } },
})

export const summaryBox = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  paddingTop: '12px',
  borderTop: `1px solid ${colors.gray100}`,
})

export const reviewBox = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  padding: '10px 14px',
  borderRadius: '8px',
  backgroundColor: colors.warning50,
  border: `1px solid ${colors.warning200}`,
})

export const editForm = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
})

export const field = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
})

export const textarea = style({
  minHeight: '64px',
  padding: '8px 10px',
  borderRadius: '8px',
  border: `1px solid ${colors.gray200}`,
  fontSize: fontStyles.bodyMd.fontSize,
  lineHeight: '150%',
  resize: 'vertical',
})

export const actions = style({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '8px',
})
