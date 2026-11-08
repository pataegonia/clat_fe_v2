'use client'

import { Fragment } from 'react'
import ChevronDownIcon from '@/assets/icons/icon-chevron-down.svg'
import type { AlimtalkBatchDetail, AlimtalkBatchListItem } from '@/services/alimtalk'
import * as styles from '../history.css'
import { formatSent, recipientLabel } from '../_lib/historyShared'
import { BatchDetailPanel } from './BatchDetailPanel'

type HistoryBatchTableProps = {
  rows: AlimtalkBatchListItem[]
  expandedId: number | null
  details: Record<number, AlimtalkBatchDetail>
  detailLoading: number | null
  detailSelectedStudentId: number | null
  onToggleRow: (batchId: number) => void
  onSelectStudent: (studentId: number) => void
  onResendClick: () => void
}

export function HistoryBatchTable({
  rows,
  expandedId,
  details,
  detailLoading,
  detailSelectedStudentId,
  onToggleRow,
  onSelectStudent,
  onResendClick,
}: HistoryBatchTableProps) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={`${styles.th} ${styles.stickyFirstCell}`}>발송 일시</th>
            <th className={styles.th}>반</th>
            <th className={styles.th}>발송 상태</th>
            <th className={styles.th}>문자 유형</th>
            <th className={styles.th}>수업 템플릿</th>
            <th className={styles.th}>발송 수</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const open = expandedId === r.batch_id
            return (
              <Fragment key={r.batch_id}>
                <tr
                  className={`${styles.trClickable}${open ? ` ${styles.trExpanded}` : ''}`}
                  onClick={() => onToggleRow(r.batch_id)}
                >
                  <td className={`${styles.td} ${styles.stickyFirstCell}`}>
                    <div className={styles.dateCell}>
                      <span
                        className={`${styles.chevron}${open ? ` ${styles.chevronOpen}` : ''}`}
                      >
                        <ChevronDownIcon width={16} height={16} />
                      </span>
                      {formatSent(r.sent_at)}
                    </div>
                  </td>
                  <td className={styles.td}>{r.class_name ?? '—'}</td>
                  <td className={styles.td}>
                    {r.fail_count > 0 ? (
                      <>
                        <span className={styles.badgeFail}>실패 {r.fail_count}건</span>
                        <button
                          type="button"
                          className={styles.resendBtn}
                          onClick={(e) => {
                            e.stopPropagation()
                            onResendClick()
                          }}
                        >
                          재발송
                        </button>
                      </>
                    ) : (
                      <span className={styles.badgeSuccess}>발송 완료</span>
                    )}
                  </td>
                  <td className={styles.td}>
                    <span
                      className={
                        r.type === 'LESSON'
                          ? styles.badgeTypeLesson
                          : r.type === 'ATTENDANCE'
                            ? styles.badgeTypeAtt
                            : styles.badgeTypeBroadcast
                      }
                    >
                      {r.type === 'LESSON'
                        ? '수업'
                        : r.type === 'ATTENDANCE'
                          ? '출결'
                          : r.type === 'REPORT'
                            ? '보고서'
                            : '공지'}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.templateTag}>{r.template_name ?? '—'}</span>
                  </td>
                  <td className={styles.td}>{recipientLabel(r.total_count)}</td>
                </tr>
                {open && (
                  <tr className={styles.detailRow}>
                    <td className={styles.td} colSpan={6}>
                      <div className={styles.detailInner}>
                        {detailLoading === r.batch_id && (
                          <div className={styles.emptyState}>상세 내역을 불러오는 중…</div>
                        )}
                        {details[r.batch_id] && (
                          <BatchDetailPanel
                            detail={details[r.batch_id]}
                            selectedStudentId={detailSelectedStudentId}
                            onSelectStudent={onSelectStudent}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
