import type { TutorialState } from './tutorialApi'
import type { TutorialAction } from './tutorialEvents'

export const TOTAL_STEPS = 7

export type TourPlace =
  | 'student'
  | 'template'
  | 'ai'
  | 'dates'
  | 'lesson-new'
  | 'lesson'

export interface TutorialBeat {
  anchor: string
  title: string
  body: string
  note?: string
  mode: 'next' | 'click' | 'action'
  action?: TutorialAction
  /** 서버 단계를 올리지 않고 이 화면 안에서만 넘어간다. */
  local?: boolean
  /** 다음을 누르면 서버 단계를 넘긴다. */
  advance?: TutorialAction
  finish?: boolean
  allowSkip?: boolean
  /** 이 값이 열리기 전에는 다음을 누를 수 없다. */
  gate?: string
  place?: TourPlace
  /** 화면 안내가 이 주소로 옮겨 섹션을 보여 준다. */
  href?: string
}

export type ScreenTourId =
  | 'student'
  | 'alimtalk-settings'
  | 'alimtalk-broadcast'
  | 'alimtalk-history'
  | 'alimtalk-test'

function todayKey() {
  const date = new Date()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function placeHref(place: TourPlace, state: TutorialState): string | null {
  switch (place) {
    case 'student':
      return state.student_id ? `/students/${state.student_id}` : null
    case 'template':
      return state.template_id ? `/template/${state.template_id}/edit` : null
    case 'ai':
      return '/ai'
    case 'dates':
      return '/lesson'
    case 'lesson-new':
      return state.class_id
        ? `/lesson/new?class_id=${state.class_id}&date=${todayKey()}&is_adhoc=false`
        : null
    case 'lesson':
      return state.lesson_id ? `/lesson/${state.lesson_id}` : null
    default:
      return null
  }
}

export function isOnPlace(pathname: string, search: string, href: string | null): boolean {
  if (!href) return false
  const url = new URL(href, 'http://local')
  if (url.pathname !== pathname) return false
  const current = new URLSearchParams(search)
  for (const [key, value] of url.searchParams) {
    if (current.get(key) !== value) return false
  }
  return true
}

export function screenForPath(pathname: string): ScreenTourId | null {
  if (/^\/students\/\d+/.test(pathname)) return 'student'
  if (pathname === '/alimtalk' || pathname === '/alimtalk/') return 'alimtalk-settings'
  if (pathname.startsWith('/alimtalk/broadcast')) return 'alimtalk-broadcast'
  if (pathname.startsWith('/alimtalk/history')) return 'alimtalk-history'
  if (pathname.startsWith('/alimtalk/test')) return 'alimtalk-test'
  return null
}

const student = (beat: Omit<TutorialBeat, 'place'>): TutorialBeat => ({ ...beat, place: 'student' })
const template = (beat: Omit<TutorialBeat, 'place'>): TutorialBeat => ({ ...beat, place: 'template' })
const ai = (beat: Omit<TutorialBeat, 'place'>): TutorialBeat => ({ ...beat, place: 'ai' })
const dates = (beat: Omit<TutorialBeat, 'place'>): TutorialBeat => ({ ...beat, place: 'dates' })
const lessonNew = (beat: Omit<TutorialBeat, 'place'>): TutorialBeat => ({ ...beat, place: 'lesson-new' })
const lesson = (beat: Omit<TutorialBeat, 'place'>): TutorialBeat => ({ ...beat, place: 'lesson' })

export const TUTORIAL_BEATS: Record<number, TutorialBeat[]> = {
  1: [
    template({
      anchor: 'template-intro',
      title: '수업 템플릿',
      body: '수업마다 적을 칸을 미리 만들어 두는 곳입니다. 이 템플릿으로 수업을 입력합니다.',
      mode: 'next',
      local: true,
    }),
    template({
      anchor: 'template-common',
      title: '공통 내용',
      body: '반 학생 모두에게 똑같이 전달하는 란입니다.\n예시: 오늘 수업 내용, 과제 범위',
      mode: 'next',
    }),
    template({
      anchor: 'template-common-add',
      title: '공통 항목 추가',
      body: '항목 추가를 눌러 주세요.',
      mode: 'click',
    }),
    template({
      anchor: 'template-common-input',
      title: '공통 내용 입력',
      body: '항목 이름을 적어 주세요. 다 적으면 빈 곳을 누릅니다.',
      mode: 'action',
      action: 'common-added',
      local: true,
    }),
    template({
      anchor: 'template-individual',
      title: '개별 내용',
      body: '학생마다 다르게 적는 칸입니다.\n예시: 테스트 점수, 과제 완료 여부',
      mode: 'next',
    }),
    template({
      anchor: 'template-individual-add',
      title: '개별 항목 추가',
      body: '항목 추가를 눌러 주세요.',
      mode: 'click',
    }),
    template({
      anchor: 'template-type-number',
      title: '점수형',
      body: '시험 점수처럼 숫자를 적는 칸입니다. 발송 시, 평균 최고점을 제공합니다.',
      mode: 'next',
      local: true,
    }),
    template({
      anchor: 'template-type-text',
      title: '텍스트형',
      body: '메모처럼 글을 적는 칸입니다.',
      mode: 'next',
      local: true,
    }),
    template({
      anchor: 'template-type-choice',
      title: '선택형',
      body: '보기를 만들어 두고 하나를 고르는 칸입니다.',
      mode: 'next',
      local: true,
    }),
    template({
      anchor: 'template-type-completion',
      title: '완료형',
      body: '숙제처럼 했는지 안 했는지 표시하는 칸입니다. 미완료 된 내용은 자동으로 분류되어 제공됩니다.',
      mode: 'next',
      local: true,
    }),
    template({
      anchor: 'template-individual-form',
      title: '항목 추가',
      body: '이름과 유형을 고른 뒤 추가를 눌러 주세요.',
      mode: 'action',
      action: 'individual-added',
      local: true,
    }),
    template({
      anchor: 'template-preview',
      title: '문자 미리보기',
      body: '오른쪽이 학부모에게 갈 문자입니다. 학원 이름은 예시입니다.',
      mode: 'next',
    }),
    template({
      anchor: 'template-save',
      title: '템플릿 저장',
      body: '저장을 눌러 주세요.',
      mode: 'action',
      action: 'template-save',
    }),
  ],
  2: [
    ai({
      anchor: 'ai-mode-AUTO',
      title: '자동',
      body: '수업 기록을 보고 AI가 피드백을 작성합니다.',
      mode: 'next',
    }),
    ai({
      anchor: 'ai-mode-ASSIST',
      title: '다듬기',
      body: '적은 메모만 말투에 맞게 다듬습니다. 없는 내용은 넣지 않습니다.',
      mode: 'next',
    }),
    ai({
      anchor: 'ai-mode-MANUAL',
      title: '직접 쓰기',
      body: '피드백 문장을 선생님이 직접 작성합니다.',
      mode: 'next',
    }),
    ai({
      anchor: 'ai-tone',
      title: '피드백 말투',
      body: '학부모에게 가는 글의 말투를 골라 주세요.',
      mode: 'next',
    }),
    ai({
      anchor: 'ai-save',
      title: '설정 저장',
      body: '저장을 눌러 주세요.',
      mode: 'action',
      action: 'ai-save',
    }),
  ],
  3: [
    dates({
      anchor: 'lesson-today',
      title: '수업 날짜',
      body: '오늘이 선택되어 있습니다. 다른 날은 날짜를 눌러 바꿉니다.',
      mode: 'next',
    }),
    dates({
      anchor: 'lesson-enter',
      title: '튜토리얼 수업 열기',
      body: '튜토리얼 수업의 입력하기를 눌러 주세요.',
      mode: 'click',
    }),
    lessonNew({
      anchor: 'lesson-template-modal',
      title: '템플릿 선택',
      body: '튜토리얼 템플릿을 고른 뒤 수업 입력하기를 눌러 주세요.',
      mode: 'action',
      action: 'lesson-create',
    }),
  ],
  4: [
    lesson({
      anchor: 'attendance-open',
      title: '출결 창 열기',
      body: '출결 시작하기를 눌러 주세요.',
      mode: 'click',
    }),
    lesson({
      anchor: 'attendance-start',
      title: '출결 문자 발송',
      body: '시간을 고르고 출결 시작을 눌러 주세요. 튜토리얼버전은 선생님 번호로 문자가 갑니다.',
      mode: 'action',
      action: 'attendance-opened',
      local: true,
    }),
    lesson({
      anchor: 'attendance-detail',
      title: '출결 현황',
      body: '출석 코드와 출석·결석 인원을 볼 수 있습니다.',
      mode: 'next',
      local: true,
    }),
    lesson({
      anchor: 'attendance-detail-students',
      title: '학생별 출결',
      body: '학생마다 출석 상태를 바로 고칠 수 있습니다.',
      mode: 'next',
      local: true,
    }),
    lesson({
      anchor: 'attendance-detail-end',
      title: '출결 종료',
      body: '출결 종료하기를 눌러 주세요.',
      mode: 'click',
      local: true,
    }),
    lesson({
      anchor: 'attendance-end-confirm',
      title: '종료 확인',
      body: '창에서 종료를 한 번 더 눌러 주세요.',
      mode: 'action',
      action: 'attendance-ended',
      allowSkip: true,
    }),
  ],
  5: [
    lesson({
      anchor: 'attendance-ended-lesson',
      title: '수업 입력 시작',
      body: '수업 입력하기를 눌러 주세요.',
      mode: 'click',
      local: true,
      allowSkip: true,
    }),
    lesson({
      anchor: 'lesson-common',
      title: '공통 내용 입력',
      body: '모두에게 보낼 내용을 적어 주세요. 다 적으면 빈 곳을 누릅니다.',
      mode: 'action',
      action: 'common-filled',
      local: true,
      allowSkip: true,
    }),
    lesson({
      anchor: 'lesson-table',
      title: '개별 내용 입력',
      body: '출결과 개별 칸을 빠짐없이 채워 주세요.',
      mode: 'action',
      action: 'lesson-input',
    }),
  ],
  6: [
    lesson({
      anchor: 'alimtalk-open',
      title: '알림톡 발송',
      body: '알림톡 전송하기를 눌러 주세요.',
      mode: 'click',
    }),
    lesson({
      anchor: 'alimtalk-message-tab',
      title: '문자 미리보기',
      body: '학부모에게 갈 문자입니다. 보내기 전에 확인합니다.',
      mode: 'next',
    }),
    lesson({
      anchor: 'alimtalk-dashboard-tab',
      title: '대시보드 미리보기',
      body: '대시보드 탭을 눌러 주세요.',
      mode: 'click',
    }),
    lesson({
      anchor: 'alimtalk-feedback',
      title: '피드백 생성',
      body: 'AI가 피드백을 다 작성하면 다음으로 넘어갑니다. 잠시 기다려 주세요.',
      mode: 'next',
      gate: 'feedback',
    }),
    lesson({
      anchor: 'alimtalk-incomplete',
      title: '미완료 항목',
      body: '완료형 칸 중 아직 하지 않은 항목만 모아서 보여 줍니다.',
      mode: 'next',
    }),
    lesson({
      anchor: 'alimtalk-recent',
      title: '최근 수업',
      body: '지난 수업의 출결과 점수를 한눈에 볼 수 있습니다.',
      mode: 'next',
    }),
    lesson({
      anchor: 'alimtalk-send-open',
      title: '발송 준비',
      body: '보내기 버튼을 눌러 주세요.',
      mode: 'click',
      allowSkip: true,
    }),
    lesson({
      anchor: 'alimtalk-send',
      title: '휴대폰 확인',
      body: '발송을 누르면 선생님 휴대폰으로 문자가 갑니다.',
      mode: 'action',
      action: 'alimtalk-send',
      allowSkip: true,
    }),
  ],
  7: [
    student({
      anchor: 'parent-dashboard',
      title: '학부모 화면',
      body: '학부모 대시보드 보기를 눌러 주세요.',
      mode: 'click',
      allowSkip: true,
    }),
  ],
}

export const PARENT_BEATS: TutorialBeat[] = [
  {
    anchor: 'parent-tab-lesson',
    title: '화면 구성',
    body: '이번 수업, 지난 수업, 공지를 볼 수 있습니다.',
    mode: 'next',
  },
  {
    anchor: 'parent-title',
    title: '이번 수업 결과',
    body: '방금 입력한 수업이 여기에 보입니다.',
    mode: 'next',
  },
  {
    anchor: 'parent-summary',
    title: '오늘 수업 요약',
    body: '출결과 적은 항목이 한곳에 모입니다.',
    mode: 'next',
  },
  {
    anchor: 'parent-feedback',
    title: '선생님 피드백',
    body: '보낸 피드백이 그대로 보입니다. 보내기 전에는 준비 중으로 보입니다.',
    mode: 'next',
  },
  {
    anchor: 'parent-incomplete',
    title: '미완료 항목',
    body: '아직 하지 못한 항목만 따로 보여 줍니다.',
    mode: 'next',
  },
  {
    anchor: 'parent-recent',
    title: '최근 수업',
    body: '지난 수업의 출결과 점수가 보입니다.',
    mode: 'next',
  },
  {
    anchor: 'parent-tab-timeline',
    title: '지난 수업',
    body: '지난 수업 탭을 눌러 주세요.',
    mode: 'click',
  },
  {
    anchor: 'parent-timeline',
    title: '이전 수업 목록',
    body: '보고 싶은 수업을 여기서 고릅니다.',
    mode: 'next',
  },
  {
    anchor: 'parent-tab-notices',
    title: '공지',
    body: '공지 탭을 눌러 주세요.',
    mode: 'click',
  },
  {
    anchor: 'parent-notices',
    title: '받은 공지',
    body: '선생님이 보낸 공지가 여기에 모입니다. 튜토리얼은 여기까지입니다.',
    mode: 'next',
    finish: true,
  },
]

export const SCREEN_TOURS: Record<ScreenTourId, TutorialBeat[]> = {
  student: [
    {
      anchor: 'student-heading',
      title: '학생 화면',
      body: '이 학생의 수업 기록을 볼 수 있습니다.',
      mode: 'next',
    },
    {
      anchor: 'student-profile',
      title: '학생 정보',
      body: '소속 반과 연락처를 볼 수 있습니다.',
      mode: 'next',
    },
    {
      anchor: 'student-scores',
      title: '점수 추이',
      body: '수업 점수를 기간별 그래프로 볼 수 있습니다.',
      mode: 'next',
    },
    {
      anchor: 'student-incomplete',
      title: '미완료 항목',
      body: '아직 하지 않은 완료형 항목만 보여 줍니다. 항목을 누르면 완료처리 할 수 있습니다.',
      mode: 'next',
    },
  ],
  'alimtalk-settings': [
    {
      anchor: 'alimtalk-intro',
      title: '문자 앞부분',
      body: '수업 문자 맨 앞에 붙는 인사입니다.',
      mode: 'next',
    },
    {
      anchor: 'alimtalk-outro',
      title: '문자 뒷부분',
      body: '수업 문자 끝에 붙는 안내입니다. 적고 나면 저장을 눌러 주세요.',
      mode: 'next',
    },
    {
      anchor: 'alimtalk-preview',
      title: '미리보기',
      body: '오른쪽에서 문자를 확인합니다.',
      mode: 'next',
    },
  ],
  'alimtalk-broadcast': [
    {
      anchor: 'alimtalk-broadcast-recipients',
      title: '받을 학생',
      body: '전체 공지는 받을 학생을 먼저 골라 주세요.',
      mode: 'next',
    },
    {
      anchor: 'alimtalk-broadcast-compose',
      title: '공지 내용',
      body: '공지 종류를 고르고 안내사항을 적어 주세요.',
      mode: 'next',
    },
    {
      anchor: 'alimtalk-broadcast-preview',
      title: '공지 미리보기',
      body: '오른쪽에서 공지 문자를 확인합니다.',
      mode: 'next',
    },
  ],
  'alimtalk-history': [
    {
      anchor: 'alimtalk-history-filters',
      title: '기록 필터',
      body: '보낸 문자를 종류별로 골라 볼 수 있습니다.',
      mode: 'next',
    },
    {
      anchor: 'alimtalk-history-list',
      title: '발송 내역',
      body: '지금까지 보낸 기록을 볼 수 있습니다.',
      mode: 'next',
    },
  ],
  'alimtalk-test': [
    {
      anchor: 'alimtalk-test-phone',
      title: '알림톡 테스트',
      body: '테스트 문자는 선생님 번호로 갑니다.',
      mode: 'next',
    },
    {
      anchor: 'alimtalk-test-kinds',
      title: '문자 종류',
      body: '수업, 출결, 공지 문자 중 골라서 받아볼 수 있습니다.',
      mode: 'next',
    },
  ],
}
