import { style } from '@vanilla-extract/css'
import { colors } from '@/styles/tokens/colors'
import { fieldTitle } from '../aiSettings.css'

/** 기능 체험 카드와 말투 배우기 상태 칸 */

export const intro = style({
  margin: '0 0 20px',
  fontSize: '14px',
  fontWeight: 500,
  letterSpacing: '-0.03em',
  color: colors.gray500,
})

export const trial = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
})

export const trialTitle = style([fieldTitle, { margin: 0 }])

export const panel = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  marginTop: '12px',
  padding: '16px',
  borderRadius: '12px',
  backgroundColor: colors.gray50,
})

export const habitList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  margin: 0,
  padding: 0,
  listStyle: 'none',
})

export const habitItem = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
})

export const effect = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
})

export const actions = style({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
  gap: '8px',
})
