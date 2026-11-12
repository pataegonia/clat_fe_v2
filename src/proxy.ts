import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const AUTH_ROUTE_PREFIXES = ['/login', '/signup', '/find-password']

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

/** 로그인 없이 열 수 있는 라우트 (토큰이 있어도 그대로 허용 — 랜딩·학부모 링크·출결 등) */
function isPublicAppRoute(pathname: string): boolean {
  return (
    pathname === '/' ||
    pathname.startsWith('/parent') ||
    pathname.startsWith('/check') ||
    pathname.startsWith('/submit') ||
    pathname.startsWith('/terms') ||
    pathname.startsWith('/privacy')
  )
}

function homeRedirect(request: NextRequest) {
  return NextResponse.redirect(new URL('/home', request.url))
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // proxy에서는 localStorage 접근 불가 -> 쿠키 기반 토큰 확인
  const token = request.cookies.get('accessToken')?.value

  if (isPublicAppRoute(pathname)) {
    return NextResponse.next()
  }

  if (isAuthRoute(pathname)) {
    if (token) {
      return homeRedirect(request)
    }
    return NextResponse.next()
  }

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  // 정적 파일(_next, favicon, .well-known, 확장자 있는 파일)은 제외
  matcher: ['/((?!_next/static|_next/image|favicon.ico|\\.well-known|.*\\.[^/]*$).*)'],
}
