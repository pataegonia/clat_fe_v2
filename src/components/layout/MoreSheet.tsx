'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ConfirmModal from '@/components/common/ConfirmModal'
import { useLogout } from '@/hooks/useLogout'
import { MORE_LINKS } from '@/lib/mobileNav'
import ClipboardIcon from '@/assets/icons/icon-clipboard.svg'
import MessageIcon from '@/assets/icons/icon-message.svg'
import FileIcon from '@/assets/icons/icon-file.svg'
import StarIcon from '@/assets/icons/icon-star.svg'
import UsersIcon from '@/assets/icons/icon-users.svg'
import LogoutIcon from '@/assets/icons/icon-logout.svg'
import { useRegisterModal } from '@/components/common/Modal/useRegisterModal'
import * as styles from './MoreSheet.css'

const LINK_ICONS = {
  '/template': ClipboardIcon,
  '/alimtalk': MessageIcon,
  '/reports': FileIcon,
  '/ai': StarIcon,
  '/me': UsersIcon,
} as const

interface MoreSheetProps {
  open: boolean
  onClose: () => void
}

export default function MoreSheet({ open, onClose }: MoreSheetProps) {
  const pathname = usePathname() ?? ''
  const logout = useLogout()
  const [logoutOpen, setLogoutOpen] = useState(false)
  useRegisterModal(open)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <div className={styles.overlayStyle} onClick={onClose} aria-hidden />
      <div className={styles.sheetStyle} role="dialog" aria-label="더보기 메뉴">
        <div className={styles.handleStyle} />
        {MORE_LINKS.map(({ href, label }) => {
          const Icon = LINK_ICONS[href]
          const isActive = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={`${styles.itemStyle}${isActive ? ` ${styles.itemActiveStyle}` : ''}`}
              onClick={onClose}
            >
              <Icon width={20} height={20} />
              {label}
            </Link>
          )
        })}
        <button
          type="button"
          className={`${styles.itemStyle} ${styles.logoutStyle}`}
          onClick={() => setLogoutOpen(true)}
        >
          <LogoutIcon width={20} height={20} />
          로그아웃
        </button>
      </div>
      <ConfirmModal
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={async () => {
          await logout()
        }}
        title="로그아웃"
        descriptions={['로그아웃 하시겠습니까?']}
        confirmLabel="로그아웃"
        confirmVariant="danger"
      />
    </>
  )
}
