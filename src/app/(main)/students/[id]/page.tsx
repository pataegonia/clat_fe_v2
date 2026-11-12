'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import ArrowLeftIcon from '@/assets/icons/icon-arrow-left.svg'
import ChoiceConfirmModal from '@/components/common/ChoiceConfirmModal/ChoiceConfirmModal'
import AddStudentFormModal from '@/components/student/AddStudentFormModal/AddStudentFormModal'
import * as styles from './studentDashboard.css'
import { MSG } from './_lib/studentDashboardShared'
import { useStudentDashboard } from './_hooks/useStudentDashboard'
import { useStudentHomeworkPhoto } from './_hooks/useStudentHomeworkPhoto'
import { StudentProfileCard } from './_components/StudentProfileCard'
import { StudentMemoCard } from './_components/StudentMemoCard'
import { HomeworkPhotoConsentCard } from './_components/HomeworkPhotoConsentCard'
import { HomeworkPhotoLinkCard } from './_components/HomeworkPhotoLinkCard'
import { StudentStatsRow } from './_components/StudentStatsRow'
import { StudentIncompleteList } from './_components/StudentIncompleteList'
import { StudentDashboardTabs } from './_components/StudentDashboardTabs'
import { studentService } from '@/services/student'
import { useToastStore } from '@/stores/toastStore'
import { TutorialReplayButton, useTutorial } from '@/features/tutorial/TutorialProvider'

export default function StudentDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = use(params)
  const studentId = Number(idStr)
  const router = useRouter()

  const dash = useStudentDashboard(studentId)
  const homeworkPhoto = useStudentHomeworkPhoto(studentId)
  const addToast = useToastStore((s) => s.addToast)
  const tour = useTutorial()
  const [openingParent, setOpeningParent] = useState(false)

  const openParentDashboard = async () => {
    setOpeningParent(true)
    try {
      const { token } = await studentService.openParentDashboard(studentId)
      if (tour.status === 'in_progress' && tour.step === 7) {
        router.push(`/parent/${token}`)
        return
      }
      const opened = window.open(`/parent/${token}`, '_blank', 'noopener,noreferrer')
      if (!opened) addToast({ variant: 'error', message: MSG.parentViewFail })
    } catch {
      addToast({ variant: 'error', message: MSG.parentViewFail })
    } finally {
      setOpeningParent(false)
    }
  }

  if (dash.loading || !dash.detail) {
    return (
      <div className={styles.pageRoot}>
        <p className={styles.emptyState}>{MSG.loading}</p>
      </div>
    )
  }

  const { detail } = dash

  return (
    <div className={styles.pageRoot}>
      <header className={styles.headerRow}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => router.back()}
          aria-label={MSG.back}
        >
          <ArrowLeftIcon width={24} height={24} />
        </button>
        <h1 className={styles.pageTitle} data-tour="student-heading">
          {MSG.pageTitle}
        </h1>
        <div className={styles.headerActions}>
          <TutorialReplayButton screen="student" />
          <button
            type="button"
            className={styles.parentViewButton}
            onClick={() => void openParentDashboard()}
            disabled={openingParent}
            data-tour="parent-dashboard"
          >
            {MSG.parentView}
          </button>
        </div>
      </header>
      <div className={styles.columns}>
        <div className={styles.leftCol}>
          <StudentProfileCard
            detail={detail}
            academyName={dash.academyName}
            classLabel={dash.classLabel}
            onEdit={dash.editStudent.open}
          />
          <StudentMemoCard memo={detail.memo ?? ''} onSave={dash.saveMemo} />
          <HomeworkPhotoConsentCard homeworkPhoto={homeworkPhoto} />
          <HomeworkPhotoLinkCard homeworkPhoto={homeworkPhoto} />
          <StudentStatsRow
            monthlyCompletionPct={dash.monthlyCompletionPct}
            monthlyAttendancePct={dash.monthlyAttendancePct}
            completionDelta={dash.completionDelta}
            attendanceDelta={dash.attendanceDelta}
            recentScoreParsed={dash.recentScoreParsed}
            scoreDelta={dash.scoreDelta}
            scoreDeltaIsPercent={dash.scoreDeltaIsPercent}
          />
          <StudentIncompleteList
            items={detail.incomplete_items}
            overdueLabel={dash.overdueLabel}
            onSelect={dash.setCompletePending}
          />
        </div>

        <div className={styles.rightCol}>
          <StudentDashboardTabs
            mainTab={dash.mainTab}
            onTabChange={dash.setMainTab}
            period={dash.period}
            onPeriodChange={dash.setPeriod}
            scoreRows={dash.scoreRows}
            lessons={dash.lessons}
            alimRows={dash.alimRows}
            aiLoading={dash.aiLoading}
            aiText={dash.aiText}
            aiSections={dash.aiSections}
            onRefreshAi={() => void dash.loadAi(true)}
          />
        </div>
      </div>

      <ChoiceConfirmModal
        isOpen={dash.completePending != null}
        onClose={() => !dash.completeSubmitting && dash.setCompletePending(null)}
        onConfirm={dash.runCompletePending}
        title={MSG.confirmComplete}
        descriptions={[...MSG.confirmCompleteDesc]}
        confirmLabel={MSG.completeActionLabel}
        confirmTone="primary"
        confirmDisabled={dash.completeSubmitting}
      />

      <AddStudentFormModal
        isOpen={dash.editStudent.isOpen}
        onClose={dash.editStudent.close}
        mode="edit"
        defaultValues={{
          name: detail.name,
          phone: detail.phone,
          parent_phone: detail.parent_phone,
          parent_phone_2: detail.parent_phone_2 ?? '',
            school_name: detail.school_name,
            grade: detail.grade ?? '',
            class_ids: detail.classes.map((c) => c.id),
        }}
        onConfirm={dash.updateStudent}
      />
    </div>
  )
}
