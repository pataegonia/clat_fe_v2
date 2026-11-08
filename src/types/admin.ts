export type AdminSession = {
  user_id: number
  name: string
  email: string
}

export type AdminMeta = {
  page: number
  limit: number
  total: number
}

export type AdminDashboard = {
  generated_at: string
  kpis: {
    total_users: number
    withdrawal_users: number
    active_users_7d: number
    total_classes: number
    active_classes: number
    ended_classes: number
    total_students: number
    total_lessons: number
    today_lessons: number
  }
  today: {
    pending_approvals: number
    withdrawal_requests: number
    recent_send_failures: number
  }
  month: {
    message_count: number
    test_message_count: number
  }
  wow: {
    lessons: { label: string; pct: number }
    signups: { label: string; pct: number }
    this_week_lessons: number
    last_week_lessons: number
    this_week_signups: number
    last_week_signups: number
  }
  signup_daily: Array<{ date: string; value: number }>
  lesson_daily: Array<{ date: string; value: number }>
  top_teachers: Array<{ id: number; name: string; lesson_count: number }>
  recent_feed: Array<{
    id: number
    lesson_date: string
    created_at: string
    is_adhoc: boolean
    class_name: string
    teacher_id: number
    teacher_name: string
    template_name: string
  }>
}

export type AdminUserTab = 'pending' | 'active' | 'inactive'

export type AdminUserListItem = {
  id: number
  email: string
  name: string
  phone: string | null
  created_at: string
  withdrawal_requested_at: string | null
  approval_status?: 'PENDING' | 'APPROVED' | 'REJECTED'
  approved_at?: string | null
  suspended_at?: string | null
  class_count: number
  student_count: number
  template_count: number
  last_lesson_at: string | null
  is_active_7d: boolean
  is_inactive_14d: boolean
}

export type AdminUserList = {
  summary: {
    pending: number
    active: number
    inactive: number
    withdrawal: number
    rejected: number
  }
  phones: string[]
  phones_skipped: {
    missing: number
    suspended: number
  }
  items: AdminUserListItem[]
  meta: AdminMeta
}

export type AdminUserDetail = {
  id: number
  email: string
  name: string
  phone: string | null
  created_at: string
  withdrawal_requested_at: string | null
  approval_status?: 'PENDING' | 'APPROVED' | 'REJECTED'
  approved_at?: string | null
  suspended_at?: string | null
  month?: {
    message_count: number
    test_message_count: number
  }
  is_active_7d: boolean
  last_lesson_at: string | null
  stats: {
    class_count: number
    active_class_count: number
    student_count: number
    template_count: number
    lesson_count: number
    adhoc_lesson_count: number
  }
  lesson_daily: Array<{ date: string; value: number }>
  classes: Array<{
    id: number
    name: string
    academy_name: string
    ended_at: string | null
    created_at: string
    student_count: number
    lesson_count: number
    days_of_week: number[]
  }>
  templates: Array<{
    id: number
    name: string
    created_at: string
    item_count: number
    lesson_count: number
  }>
  recent_lessons: Array<{
    id: number
    lesson_date: string
    created_at: string
    is_adhoc: boolean
    class_name: string
    template_name: string
  }>
}

export type AdminCreatedUser = {
  id: number
  email: string
  name: string
  created_at: string
}

export type AdminClassList = {
  summary: {
    active: number
    ended: number
    student_total: number
    avg_students: number
  }
  items: Array<{
    id: number
    name: string
    academy_name: string
    ended_at: string | null
    created_at: string
    teacher_id: number
    teacher_name: string
    teacher_email: string
    student_count: number
    lesson_count: number
    days_of_week: number[]
  }>
  meta: AdminMeta
}

export type AdminLessonList = {
  summary: {
    total: number
    adhoc: number
    adhoc_rate: number
    last_30d: number
  }
  template_usage: Array<{ id: number; name: string; lesson_count: number }>
  items: Array<{
    id: number
    lesson_date: string
    created_at: string
    is_adhoc: boolean
    class_name: string
    teacher_id: number
    teacher_name: string
    template_id: number
    template_name: string
  }>
  meta: AdminMeta
}

export type AdminAlimtalkStatus = 'all' | 'SUCCESS' | 'FAIL'
export type AdminAlimtalkBatchType = 'LESSON' | 'ATTENDANCE' | 'BROADCAST' | 'TEST' | 'REPORT'

export type AdminActionType = 'APPROVE' | 'REJECT' | 'DELETE' | 'SUSPEND' | 'RESET_PASSWORD'

export type AdminActionLogList = {
  items: Array<{
    id: number
    action: AdminActionType
    created_at: string
    actor_user_id: number
    actor_name: string | null
    actor_email: string | null
    target_user_id: number | null
    target_email: string
    target_name: string
  }>
  meta: AdminMeta
}

export type AdminAlimtalkBatchListItem = {
  batch_id: number
  batch_type: AdminAlimtalkBatchType
  delivery_mode: string
  sent_at: string
  total_count: number
  success_count: number
  fail_count: number
  teacher_id: number
  teacher_name: string
  teacher_email: string
  lesson_record_id: number | null
  class_name: string | null
  template_name: string | null
  lesson_date: string | null
}

export type AdminAlimtalkBatchList = {
  summary: {
    batch_total: number
    batch_with_fail: number
    total: number
    success: number
    fail: number
  }
  items: AdminAlimtalkBatchListItem[]
  meta: AdminMeta
}

export type AdminAlimtalkBatchMessage = {
  message_id: number
  student_id: number
  student_name: string
  phone_type: 'STUDENT' | 'PARENT'
  phone: string
  message_body: string
  status: 'SUCCESS' | 'FAIL'
  error_message: string | null
}

export type AdminAlimtalkBatchDetail = {
  batch_id: number
  batch_type: AdminAlimtalkBatchType
  delivery_mode: string
  sent_at: string
  total_count: number
  success_count: number
  fail_count: number
  body_text: string | null
  teacher_id: number
  teacher_name: string
  teacher_email: string
  lesson_record_id: number | null
  class_name: string | null
  template_name: string | null
  lesson_date: string | null
  messages: AdminAlimtalkBatchMessage[]
}

export type AdminAlimtalkList = {
  summary: { total: number; success: number; fail: number }
  items: Array<{
    message_id: number
    status: string
    phone: string
    phone_type: string
    message_preview: string
    error_message: string | null
    batch_id: number
    batch_type: string
    delivery_mode: string
    sent_at: string
    total_count: number
    success_count: number
    fail_count: number
    teacher_id: number
    teacher_name: string
    teacher_email: string
    student_name: string
    class_name: string | null
    template_name: string | null
    lesson_date: string | null
  }>
  meta: AdminMeta
}

export type AdminHealth = {
  generated_at: string
  info: {
    total_users: number
    new_users_30d: number
    withdrawal_users: number
  }
  checks: Array<{
    key: string
    label: string
    description: string
    status: 'ok' | 'warn' | 'error' | 'info'
    count: number
    samples: Array<Record<string, string | number | null>>
  }>
}
