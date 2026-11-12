import { style } from '@vanilla-extract/css'
import { colors } from '@/styles/tokens/colors'
import { fontStyles } from '@/styles/tokens/typography'
import { media } from '@/styles/tokens/breakpoints'

/** 개별 내용 표 위의 'AI 제안: 완료 8 · 미완료 1 · …' 줄과 'AI 제안 적용' 버튼 */
export const bar = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '12px 16px',
  borderRadius: '12px',
  backgroundColor: colors.primary50,
  border: `1px solid ${colors.primary100}`,
  '@media': {
    [media.phone]: {
      flexDirection: 'column',
      alignItems: 'stretch',
    },
  },
})

export const text = style({
  margin: 0,
  minWidth: 0,
  fontSize: fontStyles.bodyMd.fontSize,
  fontWeight: fontStyles.bodyMd.fontWeight,
  lineHeight: '140%',
  letterSpacing: '-0.03em',
  color: colors.gray700,
  overflowWrap: 'anywhere',
})

export const label = style({
  fontWeight: fontStyles.titleSm.fontWeight,
  color: colors.primary500,
})

export const applyButton = style({
  flexShrink: 0,
})
