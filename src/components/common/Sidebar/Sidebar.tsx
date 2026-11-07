'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useUserStore } from '@/stores/userStore'
import { useUiStore } from '@/stores/uiStore'
import { useLogout } from '@/hooks/useLogout'
import { invalidateLessonLists, queryKeys } from '@/lib/queryKeys'
import { useToastStore } from '@/stores/toastStore'
import { lessonService, type LessonSendScheduleCard } from '@/services/lesson'
import {
  sidebarStyle,
  sidebarTopStyle,
  toggleButtonStyle,
  navStyle,
  navItemStyle,
  navItemActiveStyle,
  navLabelStyle,
  logoutButtonStyle,
  sidebarBottomStyle,
  scheduleStackStyle,
  scheduleCardStyle,
  scheduleTimeStyle,
  scheduleBadgeStyle,
  scheduleClassStyle,
  scheduleDateStyle,
  scheduleDetailStyle,
  userCardStyle,
  userCardActiveStyle,
  userAvatarStyle,
  userTextWrapStyle,
  userNameStyle,
  userEmailStyle,
} from './Sidebar.css'
import ConfirmModal from '@/components/common/ConfirmModal'
import HomeIcon from '@/assets/icons/icon-home.svg'
import EditIcon from '@/assets/icons/icon-edit.svg'
import UsersIcon from '@/assets/icons/icon-users.svg'
import ClipboardIcon from '@/assets/icons/icon-clipboard.svg'
import MessageIcon from '@/assets/icons/icon-message.svg'
import FileIcon from '@/assets/icons/icon-file.svg'
import StarIcon from '@/assets/icons/icon-star.svg'
import LogoIcon from '@/assets/logo/logo-symbol.svg'
import LogoutIcon from '@/assets/icons/icon-logout.svg'
import ChevronLeftIcon from '@/assets/icons/icon-chevron-left.svg'
import ChevronRightIcon from '@/assets/icons/icon-chevron-right.svg'

const NAV_ITEMS = [
  { href: '/home', label: '\uD648', icon: HomeIcon },
  { href: '/lesson', label: '\uC218\uC5C5 \uC785\uB825', icon: EditIcon },
  { href: '/management', label: '\uD559\uC0DD\u00B7\uBC18 \uAD00\uB9AC', icon: UsersIcon },
  { href: '/template', label: '\uC218\uC5C5 \uD15C\uD50C\uB9BF', icon: ClipboardIcon },
  { href: '/alimtalk', label: '\uC54C\uB9BC\uD1A1', icon: MessageIcon },
  { href: '/reports', label: '\uBCF4\uACE0\uC11C', icon: FileIcon },
  { href: '/ai', label: 'AI \uC870\uAD50', icon: StarIcon },
]

function seoulClock(iso: string): { month: string; day: string; hour: string; minute: string } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(iso))
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ''
  const hour = read('hour') === '24' ? '00' : read('hour')
  return { month: read('month'), day: read('day'), hour, minute: read('minute') }
}

function lessonDayLabel(lessonDate: string): string {
  const [, month, day] = lessonDate.split('-')
  return `${Number(month)}월 ${Number(day)}일 수업`
}

function ScheduleCards({
  items,
  collapsed,
  onSelect,
}: {
  items: LessonSendScheduleCard[]
  collapsed: boolean
  onSelect: (item: LessonSendScheduleCard) => void
}) {
  if (items.length === 0) return null
  const mode = collapsed ? 'collapsed' : 'expanded'
  return (
    <div className={scheduleStackStyle[mode]}>
      {items.map((item) => {
        const clock = seoulClock(item.scheduled_at)
        const time = `${clock.hour}:${clock.minute}`
        const day = lessonDayLabel(item.lesson_date)
        return (
          <button
            key={item.lesson_record_id}
            type="button"
            className={scheduleCardStyle[mode]}
            title={`${item.class_name} ${day} ${time} 예약 취소`}
            onClick={() => onSelect(item)}
          >
            <span className={scheduleTimeStyle}>{time}</span>
            <span className={scheduleDetailStyle[mode]}>
              <span className={scheduleBadgeStyle}>알림톡 발송 예약</span>
              <span className={scheduleClassStyle}>{item.class_name}</span>
              <span className={scheduleDateStyle}>{day}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

function avatarInitial(name: string | undefined): string {
  const t = (name ?? '').trim()
  if (!t) return '?'
  return t.charAt(0).toUpperCase()
}

export default function Sidebar() {
  const pathname = usePathname()
  const user = useUserStore((s) => s.user)
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const logout = useLogout()

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [cancelTarget, setCancelTarget] = useState<LessonSendScheduleCard | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const queryClient = useQueryClient()
  const addToast = useToastStore((s) => s.addToast)

  const meActive = pathname.startsWith('/me')
  const mode = collapsed ? 'collapsed' : 'expanded'
  const schedulesQuery = useQuery({
    queryKey: queryKeys.lessons.sendSchedules,
    queryFn: () => lessonService.listSendSchedules(),
    enabled: Boolean(user),
    refetchInterval: 15_000,
  })
  const schedules = schedulesQuery.data ?? []

  return (
    <aside className={sidebarStyle[mode]} aria-expanded={!collapsed}>
      <div className={sidebarTopStyle[mode]}>
        <LogoIcon width={32} height={32} />
        <button
          type="button"
          className={toggleButtonStyle}
          onClick={toggleSidebar}
          aria-label={collapsed ? '\uC0AC\uC774\uB4DC\uBC14 \uD3BC\uCE58\uAE30' : '\uC0AC\uC774\uB4DC\uBC14 \uC811\uAE30'}
        >
          {collapsed ? (
            <ChevronRightIcon width={20} height={20} />
          ) : (
            <ChevronLeftIcon width={20} height={20} />
          )}
        </button>
      </div>
      <nav className={navStyle[mode]}>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname.startsWith(href) ||
            (href === '/management' && pathname.startsWith('/students'))
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`${navItemStyle[mode]}${isActive ? ` ${navItemActiveStyle}` : ''}`}
            >
              <Icon width={20} height={20} />
              <span className={navLabelStyle[mode]}>{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className={sidebarBottomStyle[mode]}>
        <ScheduleCards items={schedules} collapsed={collapsed} onSelect={setCancelTarget} />
        <Link
          href="/me"
          title={collapsed ? '\uB0B4 \uC815\uBCF4' : undefined}
          className={`${userCardStyle[mode]}${meActive ? ` ${userCardActiveStyle}` : ''}`}
          aria-label={'\uB0B4 \uC815\uBCF4'}
        >
          <span className={userAvatarStyle}>{avatarInitial(user?.name)}</span>
          <span className={userTextWrapStyle[mode]}>
            <span className={userNameStyle}>{user?.name ?? '\uB0B4 \uC815\uBCF4'}</span>
            <span className={userEmailStyle}>{user?.email ?? '\u2014'}</span>
          </span>
        </Link>

        <button
          type="button"
          className={logoutButtonStyle[mode]}
          title={collapsed ? '\uB85C\uADF8\uC544\uC6C3' : undefined}
          aria-label={'\uB85C\uADF8\uC544\uC6C3'}
          onClick={() => setIsLogoutModalOpen(true)}
        >
          <LogoutIcon width={20} height={20} />
          {!collapsed && '\uB85C\uADF8\uC544\uC6C3'}
        </button>
      </div>

      <ConfirmModal
        isOpen={cancelTarget != null}
        onClose={() => {
          if (!cancelling) setCancelTarget(null)
        }}
        onConfirm={() => {
          if (!cancelTarget || cancelling) return
          setCancelling(true)
          void lessonService
            .cancelSendSchedule(cancelTarget.lesson_record_id)
            .then(() => {
              invalidateLessonLists(queryClient)
              addToast({ variant: 'success', message: '예약을 취소했어요.' })
              setCancelTarget(null)
            })
            .catch(() => {
              addToast({ variant: 'error', message: '예약 취소에 실패했어요.' })
            })
            .finally(() => setCancelling(false))
        }}
        title="예약을 취소할까요?"
        descriptions={
          cancelTarget
            ? [
                `${cancelTarget.class_name} · ${lessonDayLabel(cancelTarget.lesson_date)} ${seoulClock(cancelTarget.scheduled_at).hour}:${seoulClock(cancelTarget.scheduled_at).minute}`,
                '예약 알림톡이 발송되지 않습니다.',
              ]
            : []
        }
        confirmLabel={cancelling ? '취소하는 중…' : '예약 취소'}
        cancelLabel="닫기"
        confirmVariant="danger"
      />

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={async () => {
          await logout()
        }}
        title="로그아웃"
        descriptions={['로그아웃 하시겠습니까?']}
        confirmLabel="로그아웃"
        confirmVariant="danger"
      />
    </aside>
  )
}
