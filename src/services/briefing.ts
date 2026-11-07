import axiosInstance from '@/lib/api/axiosInstance'

/** 오늘 브리핑 (GET /briefing/today). 선생님만 본다. */

export interface BriefingLessonRef {
  lesson_id: number
  class_name: string
  /** YYYY-MM-DD */
  lesson_date: string
}

interface BriefingTodoList<T> {
  total: number
  items: T[]
}

export type BriefingNoteCode =
  | 'ABSENT_LAST'
  | 'LATE_LAST'
  | 'HOMEWORK_STREAK'
  | 'SCORE_DROP'
  | 'FIRST_LESSON'
  | 'MEMO'

export interface BriefingNote {
  code: BriefingNoteCode
  message: string
  dates: string[]
}

export interface TodayBriefing {
  date: string
  todos: {
    unsaved_lessons: BriefingTodoList<BriefingLessonRef>
    unsent_lessons: BriefingTodoList<BriefingLessonRef>
    failed_messages: BriefingTodoList<{
      batch_id: number
      lesson_id: number | null
      class_name: string | null
      sent_at: string
      fail_count: number
    }>
    cancelled_schedules: BriefingTodoList<BriefingLessonRef>
    ai_feedback: {
      pending: number
      failed: number
      lessons: Array<BriefingLessonRef & { pending: number; failed: number }>
    }
  }
  classes: Array<{
    class_id: number
    class_name: string
    lesson_id: number | null
    student_count: number
    previous_lesson: {
      lesson_id: number
      lesson_date: string
      common_items: Array<{ name: string; value: string }>
    } | null
    /** 특이사항이 있는 학생만 */
    students: Array<{ student_id: number; name: string; notes: BriefingNote[] }>
  }>
}

export const briefingService = {
  async getToday(): Promise<TodayBriefing> {
    const { data } = await axiosInstance.get('/briefing/today')
    return (data.data ?? data) as TodayBriefing
  },
}
