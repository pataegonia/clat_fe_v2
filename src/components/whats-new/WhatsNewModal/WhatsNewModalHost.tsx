'use client'

import { useEffect, useState } from 'react'
import WhatsNewModal from '@/components/whats-new/WhatsNewModal/WhatsNewModal'
import { useTutorial } from '@/features/tutorial/TutorialProvider'
import { updateNotices } from '@/services/updateNotices'
import { useUserStore } from '@/stores/userStore'
import { whatsNewStorageKey, type UpdateNotice } from '@/lib/whatsNew'

export default function WhatsNewModalHost() {
  const user = useUserStore((s) => s.user)
  const holdWhatsNew = useTutorial().holdWhatsNew
  const [pending, setPending] = useState<UpdateNotice | null>(null)
  const [notice, setNotice] = useState<UpdateNotice | null>(null)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    ;(async () => {
      try {
        const current = await updateNotices.getCurrent()
        if (cancelled || !current) return
        const seen = window.localStorage.getItem(whatsNewStorageKey(user.id, current.id))
        if (seen === '1') return
        setPending(current)
      } catch {
        // ignore: 모달은 부가 기능
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user])

  useEffect(() => {
    if (holdWhatsNew) {
      setNotice(null)
      return
    }
    setNotice(pending)
  }, [holdWhatsNew, pending])

  const dismiss = () => {
    if (user && notice) {
      window.localStorage.setItem(whatsNewStorageKey(user.id, notice.id), '1')
    }
    setPending(null)
    setNotice(null)
  }

  return (
    <WhatsNewModal
      isOpen={Boolean(notice)}
      content={notice}
      onClose={dismiss}
    />
  )
}
