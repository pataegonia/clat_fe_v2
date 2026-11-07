export const PHONE_NAV_TABS = [
  { id: 'home', href: '/home', label: '홈' },
  { id: 'lesson', href: '/lesson', label: '수업' },
  { id: 'management', href: '/management', label: '학생' },
] as const

export type PhoneNavTabId = (typeof PHONE_NAV_TABS)[number]['id'] | 'more'

export const MORE_LINKS = [
  { href: '/template', label: '수업 템플릿' },
  { href: '/alimtalk', label: '알림톡' },
  { href: '/reports', label: '보고서' },
  { href: '/ai', label: 'AI 조교' },
  { href: '/me', label: '내 정보' },
] as const

export function isLessonDetailPath(pathname: string): boolean {
  return /^\/lesson\/\d+$/.test(pathname)
}

export function isMoreRoute(pathname: string): boolean {
  return MORE_LINKS.some(
    ({ href }) => pathname === href || pathname.startsWith(`${href}/`),
  )
}

export function getActivePhoneTab(pathname: string): PhoneNavTabId {
  if (pathname.startsWith('/lesson')) return 'lesson'
  if (pathname.startsWith('/management') || pathname.startsWith('/students')) {
    return 'management'
  }
  if (isMoreRoute(pathname)) return 'more'
  return 'home'
}

export function getMobileTitle(pathname: string): string {
  if (pathname.startsWith('/lesson/new')) return '수업 만들기'
  if (isLessonDetailPath(pathname)) return '수업 상세'
  if (pathname.startsWith('/lesson')) return '수업 입력'
  if (pathname.startsWith('/management/') && pathname !== '/management') return '반 상세'
  if (pathname.startsWith('/management')) return '학생·반 관리'
  if (pathname.startsWith('/students')) return '학생 대시보드'
  if (pathname.startsWith('/template')) return '수업 템플릿'
  if (pathname.startsWith('/alimtalk')) return '알림톡'
  if (pathname.startsWith('/reports')) return '보고서'
  if (pathname.startsWith('/ai')) return 'AI 조교'
  if (pathname.startsWith('/me')) return '내 정보'
  return '홈'
}
