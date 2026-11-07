import type { QueryClient } from '@tanstack/react-query'

export const queryKeys = {
  lessons: {
    all: ['lessons'] as const,
    day: (date: string) => ['lessons', 'day', date] as const,
    sendSchedules: ['lessons', 'send-schedules'] as const,
  },
  briefing: {
    today: ['briefing', 'today'] as const,
  },
} as const

/** 수업 목록(알림톡 배지 등) 캐시 무효화 — 구 sessionStorage 플래그 대체 */
export function invalidateLessonLists(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: queryKeys.lessons.all })
}
