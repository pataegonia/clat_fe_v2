import { useEffect, useState } from 'react'

import { homeworkPhotoService } from '@/services/homeworkPhoto'

type LoadedPhoto = { assetId: string; url: string | null; failed: boolean }

export type HomeworkPhotoBlob = {
  /** object URL. 받는 중이거나 실패하면 null */
  url: string | null
  loading: boolean
  failed: boolean
}

/**
 * 숙제 사진 한 장(로그인한 선생님만 받는 JPEG)을 object URL로 보인다.
 * URL은 이 훅이 들고 있다가 사진이 바뀌거나 화면이 닫히면 놓는다(React Query 캐시에 두지 않는다).
 */
export function useHomeworkPhotoBlob(assetId: string | null): HomeworkPhotoBlob {
  const [loaded, setLoaded] = useState<LoadedPhoto | null>(null)

  useEffect(() => {
    if (!assetId) return
    let cancelled = false
    let url: string | null = null
    homeworkPhotoService
      .photoBlob(assetId)
      .then((blob) => {
        if (cancelled) return
        url = URL.createObjectURL(blob)
        setLoaded({ assetId, url, failed: false })
      })
      .catch(() => {
        if (!cancelled) setLoaded({ assetId, url: null, failed: true })
      })
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
      // 놓은 URL이나 지난 실패가 같은 사진으로 돌아왔을 때(A → B → A) 보이지 않게 비운다.
      setLoaded(null)
    }
  }, [assetId])

  // 이전 사진의 URL(이미 놓았다)은 쓰지 않는다.
  const current = loaded && loaded.assetId === assetId ? loaded : null
  return {
    url: current?.url ?? null,
    loading: assetId !== null && current === null,
    failed: current?.failed ?? false,
  }
}
