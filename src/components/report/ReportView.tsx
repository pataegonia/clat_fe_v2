import type { ReportSnapshot, ReportSummary } from '@/services/reports'
import * as styles from './ReportView.css'

const percent = (rate: number | null) => (rate == null ? '-' : `${Math.round(rate * 100)}%`)

/** 'YYYY-MM-DD' → 'M/D' */
function shortDate(date: string) {
  const [, month, day] = date.split('-')
  return `${Number(month)}/${Number(day)}`
}

/** 보고서 숫자(반별 출석률·과제 완료율·점수 추이). 선생님 화면과 학부모 화면이 같이 쓴다. */
export function ReportNumbers({ snapshot }: { snapshot: ReportSnapshot }) {
  if (snapshot.classes.length === 0) {
    return <p className={styles.muted}>이 기간에는 수업 기록이 없어요.</p>
  }
  return (
    <div className={styles.classes}>
      {snapshot.classes.map((cls) => (
        <section key={cls.class_id} className={styles.classBlock}>
          <h4 className={styles.className}>{`${cls.class_name} · 수업 ${cls.lessons}회`}</h4>
          <dl className={styles.stats}>
            <div className={styles.stat}>
              <dt>출석률</dt>
              <dd>{percent(cls.attendance.rate)}</dd>
              <span className={styles.statNote}>
                {`출석 ${cls.attendance.present} · 지각 ${cls.attendance.late} · 결석 ${cls.attendance.absent}${
                  cls.attendance.other ? ` · 기타 ${cls.attendance.other}` : ''
                }`}
              </span>
            </div>
            <div className={styles.stat}>
              <dt>과제 완료율</dt>
              <dd>{percent(cls.homework.rate)}</dd>
              <span className={styles.statNote}>{`${cls.homework.completed}/${cls.homework.total}`}</span>
            </div>
            <div className={styles.stat}>
              <dt>평균 점수</dt>
              <dd>{cls.average_score == null ? '-' : `${cls.average_score}점`}</dd>
              <span className={styles.statNote}>100점 환산</span>
            </div>
          </dl>
          {cls.scores.length > 0 ? (
            <ul className={styles.scores}>
              {cls.scores.map((score, index) => (
                <li key={`${score.date}-${score.item_name}-${index}`}>
                  <span className={styles.muted}>{shortDate(score.date)}</span> {score.item_name}{' '}
                  <strong>{score.display}</strong>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </div>
  )
}

/** 월간 총평(잘한 점·보완할 점·다음 목표) */
export function ReportSummaryView({ summary }: { summary: ReportSummary }) {
  return (
    <dl className={styles.summary}>
      <div>
        <dt>잘한 점</dt>
        <dd>{summary.strengths}</dd>
      </div>
      <div>
        <dt>보완할 점</dt>
        <dd>{summary.improvements}</dd>
      </div>
      <div>
        <dt>다음 목표</dt>
        <dd>{summary.next_goals}</dd>
      </div>
    </dl>
  )
}
