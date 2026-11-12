import { style } from '@vanilla-extract/css'

/** 템플릿 수정 화면의 사진 숙제 AI 확인 카드 */

export const header = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '20px',
})

/** 저장하는 동안 fieldset을 막아 Dropdown을 누를 수 없게 한다. */
export const fields = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  minWidth: 0,
  margin: 0,
  padding: 0,
  border: 'none',
  selectors: {
    '&:disabled': {
      opacity: 0.6,
    },
  },
})

export const field = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  minWidth: 0,
})
