'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Modal from '@/components/common/Modal'
import Text from '@/components/common/Text'
import Textarea from '@/components/common/Textarea'
import { listItemRowStyle, listItemRowSelectedStyle } from '@/components/common/styles/listItem.css'
import CheckIcon from '@/assets/icons/icon-check.svg'
import useToast from '@/hooks/useToast'
import { isAxiosError } from '@/lib/api/http'
import { useUserStore } from '@/stores/userStore'
import { classService, type Class } from '@/services/class'
import { studentService } from '@/services/student'
import type { Student } from '@/types/student'
import { listParentPhones } from '@/lib/parentPhones'
import type { SendWarning } from '@/services/lesson'
import {
  alimtalkService,
  pollBatchUntilSettled,
  type BroadcastChannel,
  type BroadcastNoticeType,
  type AlimtalkDeliveryMode,
} from '@/services/alimtalk'
import { AlimtalkTabs } from '../_components/AlimtalkTabs'
import {
  BROADCAST_CHAR_LIMIT,
  BROADCAST_NOTICE_HINT,
  BROADCAST_NOTICE_LABEL,
  BROADCAST_NOTICE_TYPES,
  broadcastCharCount,
  renderBroadcastMessage,
  renderBroadcastPreviewHeader,
} from './_lib/broadcastNotice'
import { AlimtalkPreviewVarText } from '@/components/message/LessonAlimtalkFramePreview'
import * as frameStyles from '@/components/message/LessonAlimtalkFramePreview.css'
import * as baseStyles from '../alimtalkSettings.css'
import * as styles from './broadcast.css'

function hasPhone(value: string | null | undefined) {
  return Boolean(value && String(value).replace(/\D/g, '').length >= 8)
}

/** 발송 전 규칙 검사(dsf 같은 의미 없는 입력). 검사가 실패해도 발송은 막지 않는다. */
async function findSendWarnings(body: string): Promise<SendWarning[]> {
  try {
    return await alimtalkService.checkBroadcast(body)
  } catch {
    return []
  }
}

function resolveChannel(
  sendToParent: boolean,
  sendToStudent: boolean,
): BroadcastChannel | null {
  if (sendToParent && sendToStudent) return 'BOTH'
  if (sendToParent) return 'PARENT'
  if (sendToStudent) return 'STUDENT'
  return null
}

function isSelectable(
  student: Student,
  sendToParent: boolean,
  sendToStudent: boolean,
) {
  if (!sendToParent && !sendToStudent) return false
  if (sendToStudent && !hasPhone(student.phone)) return false
  if (sendToParent && !listParentPhones(student).some((phone) => hasPhone(phone))) return false
  return true
}

function disableReason(
  student: Student,
  sendToParent: boolean,
  sendToStudent: boolean,
) {
  if (!sendToParent && !sendToStudent) return '수신 대상 선택'
  const needStudent = sendToStudent && !hasPhone(student.phone)
  const needParent = sendToParent && !listParentPhones(student).some((phone) => hasPhone(phone))
  if (needStudent && needParent) return '번호 없음'
  if (needStudent) return '학생번호 없음'
  if (needParent) return '학부모번호 없음'
  return ''
}

function estimateCount(
  selected: Student[],
  sendToParent: boolean,
  sendToStudent: boolean,
) {
  let total = 0
  for (const student of selected) {
    if (sendToStudent && hasPhone(student.phone)) total += 1
    if (sendToParent) {
      total += listParentPhones(student).filter((phone) => hasPhone(phone)).length
    }
  }
  return total
}

export default function AlimtalkBroadcastPage() {
  const router = useRouter()
  const { success, error } = useToast()
  const teacherName = useUserStore((s) => s.user?.name) ?? ''

  const [deliveryMode, setDeliveryMode] = useState<AlimtalkDeliveryMode>('mock')
  const [classes, setClasses] = useState<Class[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [classStudentIds, setClassStudentIds] = useState<Record<number, number[]>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterClassId, setFilterClassId] = useState<number | null>(null)
  const [sendToParent, setSendToParent] = useState(true)
  const [sendToStudent, setSendToStudent] = useState(false)
  const [noticeType, setNoticeType] = useState<BroadcastNoticeType>('MAKEUP')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [sendProgress, setSendProgress] = useState<{ sent: number; total: number } | null>(null)
  const [lengthOpen, setLengthOpen] = useState(false)
  const [lengthNames, setLengthNames] = useState<string[]>([])
  const [warningOpen, setWarningOpen] = useState(false)
  const [warnings, setWarnings] = useState<SendWarning[]>([])

  const channel = resolveChannel(sendToParent, sendToStudent)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [settings, classRes, studentRes] = await Promise.all([
          alimtalkService.getSettings(),
          classService.getClasses({ status: 'active' }),
          studentService.getStudents(),
        ])
        if (cancelled) return
        setDeliveryMode(settings.delivery_mode)
        setClasses(classRes.data)
        setStudents(studentRes.data)

        const map: Record<number, number[]> = {}
        await Promise.all(
          classRes.data.map(async (c) => {
            try {
              const list = await classService.getClassStudents(c.id)
              map[c.id] = list.map((s) => s.id)
            } catch {
              map[c.id] = []
            }
          }),
        )
        if (!cancelled) setClassStudentIds(map)
      } catch {
        if (!cancelled) error('학생·반 목록을 불러오지 못했어요.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once
  }, [])

  useEffect(() => {
    setSelectedIds((prev) => {
      const next = new Set<number>()
      for (const id of prev) {
        const st = students.find((s) => s.id === id)
        if (st && isSelectable(st, sendToParent, sendToStudent)) next.add(id)
      }
      return next
    })
  }, [sendToParent, sendToStudent, students])

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase()
    return students.filter((s) => {
      if (filterClassId != null) {
        const inClass =
          (classStudentIds[filterClassId] ?? []).includes(s.id) ||
          s.classes?.some((c) => c.id === filterClassId)
        if (!inClass) return false
      }
      if (!q) return true
      return (
        s.name.toLowerCase().includes(q) ||
        s.classes?.some((c) => c.name.toLowerCase().includes(q))
      )
    })
  }, [students, search, filterClassId, classStudentIds])

  const selectableFiltered = useMemo(
    () =>
      filteredStudents.filter((s) =>
        isSelectable(s, sendToParent, sendToStudent),
      ),
    [filteredStudents, sendToParent, sendToStudent],
  )

  const allFilteredSelected =
    selectableFiltered.length > 0 &&
    selectableFiltered.every((s) => selectedIds.has(s.id))

  const toggleStudent = useCallback(
    (student: Student) => {
      if (!isSelectable(student, sendToParent, sendToStudent)) return
      setSelectedIds((prev) => {
        const next = new Set(prev)
        if (next.has(student.id)) next.delete(student.id)
        else next.add(student.id)
        return next
      })
    },
    [sendToParent, sendToStudent],
  )

  const selectAllFiltered = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      for (const s of selectableFiltered) next.add(s.id)
      return next
    })
  }, [selectableFiltered])

  const clearFiltered = useCallback(() => {
    const remove = new Set(filteredStudents.map((s) => s.id))
    setSelectedIds((prev) => {
      const next = new Set<number>()
      for (const id of prev) {
        if (!remove.has(id)) next.add(id)
      }
      return next
    })
  }, [filteredStudents])

  const clearAll = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const filterClassName = useMemo(() => {
    if (filterClassId == null) return null
    return classes.find((c) => c.id === filterClassId)?.name ?? null
  }, [classes, filterClassId])

  const previewHeader = useMemo(
    () => renderBroadcastPreviewHeader(noticeType),
    [noticeType],
  )

  const academyName = useMemo(() => {
    if (classes.length === 0) return ''
    return [...classes].sort((a, b) => a.id - b.id)[0]?.academy_name ?? ''
  }, [classes])

  const noticeBody = body.trim()

  const charCountFor = useCallback(
    (studentName: string) =>
      broadcastCharCount(
        renderBroadcastMessage(academyName, teacherName, studentName, noticeType, noticeBody),
      ),
    [academyName, teacherName, noticeType, noticeBody],
  )

  const overNames = useMemo(() => {
    return students
      .filter(
        (student) =>
          selectedIds.has(student.id) &&
          isSelectable(student, sendToParent, sendToStudent) &&
          charCountFor(student.name) > BROADCAST_CHAR_LIMIT,
      )
      .map((student) => student.name)
  }, [students, selectedIds, sendToParent, sendToStudent, charCountFor])

  const previewCount = useMemo(() => {
    const selected = students.filter(
      (student) =>
        selectedIds.has(student.id) && isSelectable(student, sendToParent, sendToStudent),
    )
    const names = selected.length > 0 ? selected.map((student) => student.name) : ['']
    return Math.max(...names.map((name) => charCountFor(name)))
  }, [students, selectedIds, sendToParent, sendToStudent, charCountFor])

  const expectedCount = estimateCount(
    students.filter((student) => selectedIds.has(student.id)),
    sendToParent,
    sendToStudent,
  )

  const handleSend = async (skipWarningCheck = false) => {
    if (sending) return
    if (!channel) {
      error('학부모 또는 학생 중 하나 이상 선택해 주세요.')
      return
    }
    if (selectedIds.size === 0) {
      error('보낼 학생을 선택해 주세요.')
      return
    }
    if (!body.trim()) {
      error('안내사항을 입력해 주세요.')
      return
    }
    if (overNames.length > 0) {
      setLengthNames(overNames)
      setLengthOpen(true)
      return
    }
    if (!skipWarningCheck) {
      setSending(true)
      const found = await findSendWarnings(body.trim())
      setSending(false)
      if (found.length > 0) {
        setWarnings(found)
        setWarningOpen(true)
        return
      }
    }

    setSending(true)
    setSendProgress(null)
    try {
      const queued = await alimtalkService.sendBroadcast({
        student_ids: [...selectedIds],
        channel,
        notice_type: noticeType,
        body: body.trim(),
      })
      const res =
        queued.status === 'done'
          ? { success_count: 0, fail_count: 0 }
          : await pollBatchUntilSettled(queued.batch_id, (sent, total) => {
              setSendProgress({ sent, total })
            })
      if (res.fail_count > 0) {
        error(`발송 완료 · 실패 ${res.fail_count}건 (성공 ${res.success_count}건)`)
      } else {
        success(`발송 완료 · ${res.success_count}건`)
      }
      router.push('/alimtalk/history')
    } catch (err) {
      const tooLong = tooLongNames(err)
      if (tooLong) {
        setLengthNames(tooLong)
        setLengthOpen(true)
        return
      }
      error('발송에 실패했어요. 발송 내역에서 결과를 확인해 주세요.')
    } finally {
      setSending(false)
      setSendProgress(null)
    }
  }

  if (loading) return null

  return (
    <div className={baseStyles.pageRoot}>
      <h1 className={baseStyles.pageTitle}>알림톡</h1>

      {deliveryMode === 'mock' && (
        <div className={baseStyles.deliveryBanner}>
          현재 <strong>모의 전송(mock)</strong> 모드입니다. 실제 카카오 알림톡은 발송되지
          않아요.
        </div>
      )}

      <AlimtalkTabs />

      <div className={styles.layout}>
        <section
          className={`${styles.panel} ${styles.recipientPanel}`}
          aria-label="수신자 선택"
          data-tour="alimtalk-broadcast-recipients"
        >
          <div className={styles.sectionHeader}>
            <div className={styles.sectionHeaderText}>
              <Text as="h2" variant="headingSm">
                수신자 선택
              </Text>
              <Text as="p" variant="labelSm" color="gray500">
                반으로 목록을 좁힌 뒤, 보이는 학생을 선택하세요
              </Text>
            </div>
            <span className={styles.countBadge}>{selectedIds.size}명 선택</span>
          </div>

          <div className={styles.searchWrap}>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="학생 이름 · 반 이름 검색"
              aria-label="학생 검색"
            />
          </div>

          <div className={styles.sectionBlock}>
            <Text as="h3" variant="titleSm" color="gray700">
              반
            </Text>
            <div className={styles.filterRow}>
              <button
                type="button"
                className={`${styles.filterChip} ${filterClassId == null ? styles.filterChipActive : styles.filterChipInactive}`}
                onClick={() => setFilterClassId(null)}
              >
                전체
              </button>
              {classes.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`${styles.filterChip} ${filterClassId === c.id ? styles.filterChipActive : styles.filterChipInactive}`}
                  onClick={() =>
                    setFilterClassId((prev) => (prev === c.id ? null : c.id))
                  }
                >
                  {c.name}
                  <span className={styles.filterChipCount}>{c.student_count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.toolbar}>
            <div className={styles.toolbarActions}>
              <Button
                variant="ghost"
                size="sm"
                onClick={allFilteredSelected ? clearFiltered : selectAllFiltered}
                disabled={selectableFiltered.length === 0}
              >
                {allFilteredSelected
                  ? '이 목록 선택 해제'
                  : filterClassName
                    ? `${filterClassName} 전체 선택`
                    : '표시된 학생 전체 선택'}
              </Button>
              <Button variant="ghost" size="sm" onClick={clearAll}>
                선택 모두 해제
              </Button>
            </div>
            <Text as="span" variant="labelSm" color="gray500">
              표시 {filteredStudents.length}명 · 선택 가능 {selectableFiltered.length}명
            </Text>
          </div>

          <div className={styles.studentList}>
            {filteredStudents.length === 0 ? (
              <div className={styles.emptyList}>
                <Text as="p" variant="bodyMd" color="gray500">
                  조건에 맞는 학생이 없어요.
                </Text>
              </div>
            ) : (
              filteredStudents.map((s) => {
                const ok = isSelectable(s, sendToParent, sendToStudent)
                const checked = selectedIds.has(s.id)
                const over = ok && charCountFor(s.name) > BROADCAST_CHAR_LIMIT
                return (
                  <button
                    key={s.id}
                    type="button"
                    className={`${listItemRowStyle} ${styles.studentRowButton}${checked ? ` ${listItemRowSelectedStyle}` : ''}${ok ? '' : ` ${styles.studentRowDisabled}`}`}
                    aria-pressed={checked}
                    disabled={!ok}
                    onClick={() => toggleStudent(s)}
                  >
                    {checked ? (
                      <span className={styles.checkBoxOn} aria-hidden>
                        <CheckIcon width={16} height={16} />
                      </span>
                    ) : (
                      <span className={styles.checkBox} aria-hidden />
                    )}
                    <span className={styles.studentName}>{s.name}</span>
                    <span className={over ? styles.studentMetaOver : styles.studentMeta}>
                      {over
                        ? '1,000자 초과'
                        : ok
                          ? s.classes?.map((c) => c.name).join(', ') || '—'
                          : disableReason(s, sendToParent, sendToStudent)}
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </section>

        <section className={styles.composeStack} aria-label="공지 작성">
          <div className={styles.panel} data-tour="alimtalk-broadcast-compose">
            <div className={styles.sectionHeaderText}>
              <Text as="h2" variant="headingSm">
                공지 작성
              </Text>
              <Text as="p" variant="labelSm" color="gray500">
                종류를 고르면 알림톡 문안이 바뀌고, 입력은 안내사항만 들어갑니다
              </Text>
            </div>

            <div className={styles.sectionBlock}>
              <Text as="h3" variant="titleSm" color="gray700">
                공지 종류
              </Text>
              <div className={styles.typeGrid} role="radiogroup" aria-label="공지 종류">
                {BROADCAST_NOTICE_TYPES.map((type) => {
                  const active = noticeType === type
                  return (
                    <button
                      key={type}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      className={`${styles.typeCard}${active ? ` ${styles.typeCardActive}` : ''}`}
                      onClick={() => setNoticeType(type)}
                    >
                      <span
                        className={`${styles.typeCardTitle}${active ? ` ${styles.typeCardTitleActive}` : ''}`}
                      >
                        {BROADCAST_NOTICE_LABEL[type]}
                      </span>
                      <span className={styles.typeCardHint}>{BROADCAST_NOTICE_HINT[type]}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className={styles.sectionBlock}>
              <Text as="h3" variant="titleSm" color="gray700">
                수신 대상
              </Text>
              <div className={styles.channelRow} role="group" aria-label="수신 대상">
                <button
                  type="button"
                  className={`${styles.channelCheck}${sendToParent ? ` ${styles.channelCheckActive}` : ''}`}
                  aria-pressed={sendToParent}
                  onClick={() => setSendToParent((v) => !v)}
                >
                  학부모에게 보내기
                </button>
                <button
                  type="button"
                  className={`${styles.channelCheck}${sendToStudent ? ` ${styles.channelCheckActive}` : ''}`}
                  aria-pressed={sendToStudent}
                  onClick={() => setSendToStudent((v) => !v)}
                >
                  학생에게 보내기
                </button>
              </div>
            </div>

            <div className={styles.bodyField}>
              <Text as="label" variant="titleSm" color="gray700">
                안내사항
              </Text>
              <Textarea
                className={styles.bodyTextarea}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="예: 내일 오후 7시, 3층 강의실에서 보강합니다."
                aria-label="안내사항"
              />
            </div>

            <div className={styles.summaryBar}>
              <Text as="p" variant="bodyMd" color="gray700">
                선택 {selectedIds.size}명 · 예상 발송 {expectedCount}건
              </Text>
              <Button
                variant="primary"
                size="md"
                onClick={() => void handleSend()}
                disabled={sending}
              >
                {sendProgress
                  ? `보내는 중 ${sendProgress.sent}/${sendProgress.total}`
                  : sending
                    ? '발송 중…'
                    : '발송하기'}
              </Button>
            </div>
          </div>

          <div className={baseStyles.previewColumn} data-tour="alimtalk-broadcast-preview">
            <h2 className={baseStyles.previewTitle}>알림톡 미리보기</h2>
            <div className={baseStyles.previewPhoneShell}>
              <div className={baseStyles.previewLogoRow}>
                <div className={baseStyles.previewLogoPlaceholder} />
                <span className={baseStyles.previewAppLabel}>클랫 수업 알림</span>
              </div>
              <div className={baseStyles.previewHeaderBar}>
                <p className={baseStyles.previewHeaderText}>알림톡 상세 도착</p>
              </div>
              <div className={baseStyles.previewBubble}>
                <AlimtalkPreviewVarText text={previewHeader} highlightVars />
                {body.trim() ? (
                  <p className={frameStyles.bodyText}>{body.trim()}</p>
                ) : (
                  <AlimtalkPreviewVarText
                    text="{안내사항}"
                    highlightVars
                    className={frameStyles.bodyText}
                  />
                )}
              </div>
              <Text
                as="p"
                variant="labelSm"
                color={previewCount > BROADCAST_CHAR_LIMIT ? 'error500' : 'gray500'}
                className={styles.lengthLine}
              >
                {`${previewCount.toLocaleString('ko-KR')}자 / 1,000자`}
              </Text>
              <p className={baseStyles.previewTime}>오후 09:54</p>
            </div>
          </div>
        </section>
      </div>
      <Modal isOpen={lengthOpen} onClose={() => setLengthOpen(false)} size="sm">
        <div className={styles.lengthBody}>
          <Text variant="headingMd" as="h2" className={styles.lengthTitle}>
            1000자를 넘어가는 문자가 있어요
          </Text>
          {lengthNames.map((name, index) => (
            <Text key={`${name}-${index}`} variant="bodyLg" color="gray500">
              {name}
            </Text>
          ))}
        </div>
        <Button variant="primary" size="md" fullWidth onClick={() => setLengthOpen(false)}>
          확인
        </Button>
      </Modal>
      <Modal isOpen={warningOpen} onClose={() => setWarningOpen(false)} size="sm">
        <div className={styles.lengthBody}>
          <Text variant="headingMd" as="h2" className={styles.lengthTitle}>
            보내기 전에 확인해 주세요
          </Text>
          {warnings.map((warning, index) => (
            <Text key={`${warning.code}-${index}`} variant="bodyLg" color="gray500">
              {warning.message}
            </Text>
          ))}
        </div>
        <div className={styles.warningActions}>
          <Button variant="ghost" size="md" fullWidth onClick={() => setWarningOpen(false)}>
            고칠게요
          </Button>
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={() => {
              setWarningOpen(false)
              void handleSend(true)
            }}
          >
            그대로 보내기
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function tooLongNames(error: unknown): string[] | null {
  if (!isAxiosError(error)) return null
  const body = (
    error.response?.data as {
      error?: { code?: string; students?: Array<{ student_name?: string }> }
    }
  )?.error
  if (body?.code !== 'MESSAGE_TOO_LONG') return null
  const students = Array.isArray(body.students) ? body.students : []
  return students.map((student) => student.student_name || '학생')
}
