'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Text from '@/components/common/Text'
import Dropdown from '@/components/common/Dropdown'
import { useToastStore } from '@/stores/toastStore'
import { useHomeworkPhotoTrial } from '@/hooks/useHomeworkPhotoTrial'
import { homeworkPhotoService } from '@/services/homeworkPhoto'
import { hwKeys } from '@/lib/homeworkPhoto/queryKeys'
import { HW_FEATURE_LABEL } from '@/lib/homeworkPhoto/labels'
import type { HwItemOption, HwTemplateSetting, HwTemplateSettingBody } from '@/types/homeworkPhoto'
import { sectionBoxStyle } from '../../../template-form.css'
import * as css from './HomeworkPhotoTemplateCard.css'

/** Dropdown에서 고르지 않음·없음의 값 */
const NONE = ''

/** 후보에 있는 항목만 고른 것으로 본다(지운 항목을 가리키는 설정은 고르지 않은 것과 같다). */
function validId(id: number | null, candidates: HwItemOption[]): number | null {
  return id !== null && candidates.some((c) => c.id === id) ? id : null
}

/** 서버 설정 중 지금 고를 수 있는 값만 남긴 것. 한쪽만 바꿀 때 다른 쪽은 이 값을 같이 보낸다. */
function currentSelection(setting: HwTemplateSetting): HwTemplateSettingBody {
  return {
    complete_item_id: validId(setting.complete_item_id, setting.complete_candidates),
    range_item_id: validId(setting.range_item_id, setting.range_candidates),
  }
}

function toOptions(noneLabel: string, candidates: HwItemOption[]) {
  return [
    { label: noneLabel, value: NONE },
    ...candidates.map((c) => ({ label: c.name, value: String(c.id) })),
  ]
}

function toValue(id: number | null): string {
  return id === null ? NONE : String(id)
}

function toId(value: string): number | null {
  return value === NONE ? null : Number(value)
}

/** 숙제 항목·숙제 범위 항목 고르기. 고르면 바로 저장한다(템플릿 저장 버튼과 따로). */
function SettingFields({ templateId }: { templateId: number }) {
  const queryClient = useQueryClient()
  const addToast = useToastStore((s) => s.addToast)
  const { data, isPending } = useQuery({
    queryKey: hwKeys.template(templateId),
    queryFn: () => homeworkPhotoService.getTemplateSetting(templateId),
    // 템플릿을 저장해 항목이 바뀌었을 수 있으므로 들어올 때마다 다시 읽는다.
    refetchOnMount: 'always',
  })
  const save = useMutation({
    mutationFn: (body: HwTemplateSettingBody) =>
      homeworkPhotoService.setTemplateSetting(templateId, body),
    onSuccess: () => addToast({ variant: 'success', message: '저장했어요.' }),
    onError: () => addToast({ variant: 'error', message: '저장하지 못했어요.' }),
    // 다시 읽을 때까지 막는다(promise를 돌려준다). 수업 표의 숙제 열도 이 설정을 따른다.
    onSettled: () => queryClient.invalidateQueries({ queryKey: hwKeys.all }),
  })

  if (isPending) return <Text color="gray500">불러오는 중…</Text>
  if (!data) {
    return <Text color="error500">설정을 불러오지 못했어요. 잠시 뒤 다시 열어 주세요.</Text>
  }

  // 저장하는 동안에는 보낸 값을 보인다.
  const shown = save.isPending && save.variables ? save.variables : currentSelection(data)
  const change = (patch: Partial<HwTemplateSettingBody>) => {
    const next = { ...shown, ...patch }
    const same =
      next.complete_item_id === shown.complete_item_id && next.range_item_id === shown.range_item_id
    if (!same) save.mutate(next)
  }
  const effective = data.complete_candidates.find((c) => c.id === data.effective_complete_item_id)

  return (
    <fieldset className={css.fields} disabled={save.isPending}>
      <div className={css.field}>
        <Text variant="titleSm" color="gray700">
          숙제 항목
        </Text>
        <Dropdown
          fullWidth
          options={toOptions('고르지 않음', data.complete_candidates)}
          value={toValue(shown.complete_item_id)}
          onChange={(value) => change({ complete_item_id: toId(value) })}
        />
        {shown.complete_item_id === null ? (
          <Text variant="labelSm" color="gray500">
            고르지 않으면 완료형 항목이 하나일 때만 그 항목을 써요.
          </Text>
        ) : null}
        {!save.isPending && effective && effective.id !== shown.complete_item_id ? (
          <Text variant="labelSm" color="gray700">{`지금은 '${effective.name}' 항목을 써요.`}</Text>
        ) : null}
      </div>
      <div className={css.field}>
        <Text variant="titleSm" color="gray700">
          숙제 범위 항목
        </Text>
        <Dropdown
          fullWidth
          options={toOptions('없음', data.range_candidates)}
          value={toValue(shown.range_item_id)}
          onChange={(value) => change({ range_item_id: toId(value) })}
        />
      </div>
    </fieldset>
  )
}

/**
 * 템플릿 수정 화면의 "사진 숙제 AI 확인" 카드. 기능 체험을 켠 선생님에게만 보인다.
 * 아직 저장하지 않은 새 항목은 서버가 모르므로 고를 수 없다.
 */
export default function HomeworkPhotoTemplateCard({ templateId }: { templateId: number }) {
  const { enabled } = useHomeworkPhotoTrial()
  if (!enabled) return null
  return (
    <section className={sectionBoxStyle}>
      <div className={css.header}>
        <Text variant="headingMd" as="h2">
          {HW_FEATURE_LABEL}
        </Text>
        <Text variant="bodyMd" color="gray500">
          저장한 항목만 고를 수 있어요.
        </Text>
      </div>
      <SettingFields templateId={templateId} />
    </section>
  )
}
