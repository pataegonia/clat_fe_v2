import type { ReactNode } from 'react'
import Text from '@/components/common/Text'
import Button from '@/components/common/Button'
import Modal from '@/components/common/Modal'
import { contentStyle, actionsStyle, titleStyle } from './ConfirmModal.css'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  descriptions?: string[]
  /** 설명 아래, 버튼 위에 넣을 추가 입력 (예: 사유 선택) */
  children?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  confirmVariant?: 'primary' | 'danger' | 'deleteClass' | 'endClass'
  confirmTour?: string
  tour?: string
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  descriptions,
  children,
  confirmLabel = '확인',
  cancelLabel = '취소',
  confirmVariant = 'primary',
  confirmTour,
  tour,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" tour={tour}>
      <div className={contentStyle}>
        <Text variant="headingMd" as="h2" className={titleStyle}>
          {title}
        </Text>
        {descriptions &&
          descriptions.map((desc, i) => (
            <Text key={i} variant="bodyLg" color="gray500">
              {desc}
            </Text>
          ))}
        {children}
      </div>
      <div className={actionsStyle}>
        <Button variant="ghost" size="md" fullWidth onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button variant={confirmVariant} size="md" fullWidth onClick={onConfirm} data-tour={confirmTour}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
