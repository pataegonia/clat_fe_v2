'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Text from '@/components/common/Text'
import Button from '@/components/common/Button'
import ArrowLeftIcon from '@/assets/icons/icon-arrow-left.svg'
import SaveIcon from '@/assets/icons/icon-save.svg'
import TemplateName from '../../_components/TemplateName/TemplateName'
import ContentSection from '../../_components/ContentSection/ContentSection'
import MessageSettings from '../../_components/MessageSettings/MessageSettings'
import MessagePreview from '../../_components/MessagePreview/MessagePreview'
import HomeworkPhotoTemplateCard from './_components/HomeworkPhotoTemplateCard'
import {
  pageStyle,
  leftSectionStyle,
  rightSectionStyle,
  sectionBoxStyle,
  formHeaderStyle,
  formHeaderLeftStyle,
  formBackButtonStyle,
} from '../../template-form.css'
import useTemplateEditor from '@/hooks/useTemplateEditor'
import { templateService, toEditorItems } from '@/services/template'
import type { TemplateItem } from '../../_types/template'

type EditorInitialData = Parameters<typeof useTemplateEditor>[0]

const ATTENDANCE_DISPLAY: TemplateItem = {
  id: '__attendance__',
  label: '출결 *',
  isActive: true,
  isInMessage: true,
  sendToParent: true,
  sendToStudent: true,
  locked: true,
  category: 'individual',
  itemType: 'attendance',
}

function TemplateEditForm({ id, initialData }: { id: number; initialData: EditorInitialData }) {
  const router = useRouter()
  const editor = useTemplateEditor(initialData)

  return (
    <>
      <div className={formHeaderStyle}>
        <div className={formHeaderLeftStyle}>
          <button className={formBackButtonStyle} onClick={() => router.back()}>
            <ArrowLeftIcon width={24} height={24} />
          </button>
          <div data-tour="template-intro">
            <Text variant="display" as="h1">
              수업 템플릿 수정
            </Text>
          </div>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<SaveIcon width={16} height={16} />}
          onClick={() => editor.handleUpdate(id)}
          disabled={editor.isSaving}
          data-tour="template-save"
        >
          {editor.isSaving ? '저장 중...' : '저장'}
        </Button>
      </div>
      <div className={pageStyle}>
        <div className={leftSectionStyle}>
          <div className={sectionBoxStyle}>
            <TemplateName value={editor.templateName} onChange={editor.setTemplateName} />
            <div style={{ marginTop: '100px' }}>
              <ContentSection
                title="공통 내용"
                description="모든 학생에게 동일하게 전달할 내용이에요"
                tourId="common"
                items={editor.commonItems}
                onToggle={editor.handleToggleCommonItem}
                onDelete={editor.handleDeleteCommonItem}
                onAddInline={editor.handleAddCommonItem}
                onUpdate={editor.handleUpdateCommonItem}
              />
            </div>
            <div style={{ marginTop: '100px' }}>
              <ContentSection
                title="개별 내용"
                description="학생마다 다르게 전달할 내용이에요"
                tourId="individual"
                items={[ATTENDANCE_DISPLAY, ...editor.individualItems]}
                onToggle={(id) => {
                  if (id !== '__attendance__') editor.handleToggleIndividualItem(id)
                }}
                onDelete={(id) => {
                  if (id !== '__attendance__') editor.handleDeleteIndividualItem(id)
                }}
                onAdd={editor.handleAddIndividualItem}
              />
            </div>
          </div>
          <HomeworkPhotoTemplateCard templateId={id} />
        </div>
        <div className={rightSectionStyle}>
          <div className={sectionBoxStyle}>
            <MessageSettings
              messageOrder={editor.messageOrder}
              allItemsMap={editor.allItemsMap}
              onToggle={editor.handleMessagePreviewToggle}
              onRecipientToggle={editor.handleRecipientToggle}
              onReorder={editor.handleMessageReorder}
            />
          </div>
          <div className={sectionBoxStyle}>
            <MessagePreview
              messageOrder={editor.messageOrder}
              allItemsMap={editor.allItemsMap}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default function TemplateEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [initialData, setInitialData] = useState<EditorInitialData>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    templateService.getTemplate(Number(id))
      .then((detail) => {
        setInitialData(toEditorItems(detail))
        setIsLoading(false)
      })
      .catch(() => {
        alert('템플릿을 불러오지 못했습니다.')
        router.push('/template')
      })
  }, [id])

  if (isLoading || !initialData) return null

  return <TemplateEditForm id={Number(id)} initialData={initialData} />
}