/**
 * 사진 숙제 AI 확인 React Query 키. 모두 ['homework-photo'] 아래에 두어
 * 기능 체험을 켜고 끄거나 사진을 지운 뒤 hwKeys.all 하나로 다시 읽게 한다.
 */
export const hwKeys = {
  all: ['homework-photo'] as const,
  status: ['homework-photo', 'status'] as const,
  student: (studentId: number) => ['homework-photo', 'student', studentId] as const,
  template: (templateId: number) => ['homework-photo', 'template', templateId] as const,
  lesson: (lessonId: number) => ['homework-photo', 'lesson', lessonId] as const,
}
