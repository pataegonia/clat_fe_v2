import type { Metadata } from 'next'
import * as styles from './submit.css'

/** 학생 숙제 제출 화면. 로그인 없이 열고, 검색에 올리지 않으며, 주소를 다른 곳에 넘기지 않는다. */
export const metadata: Metadata = {
  title: '숙제 내기',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

export default function SubmitLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className={styles.page}>
      <div className={styles.column}>{children}</div>
    </main>
  )
}
