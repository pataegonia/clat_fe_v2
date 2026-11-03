export const APP_URL = '/login'

export const painPoints = [
  {
    parts: [
      { text: '수업 끝나고 출결·점수·과제를 엑셀이랑 메모장에 ' },
      { text: '따로따로 정리', highlight: true },
    ],
    image: '/images/pain-excel.png',
  },
  {
    parts: [
      { text: '학부모 문자, 학생 수만큼 ' },
      { text: '하나하나 직접 작성', highlight: true },
    ],
    image: '/images/pain-message.png',
  },
  {
    parts: [
      { text: '“이 학생 과제 냈던가?” 명단 ' },
      { text: '처음부터 다시 훑기', highlight: true },
    ],
    image: '/images/pain-search.png',
  },
]

export const solutions = [
  {
    pain: '일일히 한명씩\n출결 체크',
    title: '알림톡 출결',
    description: '학생에게 알림톡으로 출결 링크가\n발송되어 편하게 체크해요',
    icon: '/images/icon-folder.png',
  },
  {
    pain: '출결·과제·문자\n전부 혼자 챙김',
    title: '수업 기록 · 추적 자동화',
    description: '미완료 학생을 자동으로 추려줘서\n놓치는 일이 없어요',
    icon: '/images/icon-star.png',
  },
  {
    pain: '학부모 문자\n30분 이상 소요',
    title: '간편한 문자 생성 및 알림톡 발송',
    description: '수업 데이터를 입력하면\n버튼 하나로 알림톡이 발송돼요',
    icon: '/images/icon-message.png',
  },
  {
    pain: '체계는 필요한데\n시스템은 부담스러움',
    title: '가입 후 바로 시작',
    description: '설치도, 미팅도 필요 없어요.\n오늘 당장 쓸 수 있어요',
    icon: '/images/icon-click.png',
  },
]

export const benefits = [
  {
    badge: '핵심 가치 1',
    title: '빠른 수업 정리',
    description:
      '템플릿을 한 번 만들면 매 수업마다 재사용할 수 있어요. 수업 외 행정 시간을 줄여 드립니다.',
    image: '/images/value-clock.png',
  },
  {
    badge: '핵심 가치 2',
    title: '높은 품질',
    description: '학생과 학부모에게 더 꼼꼼하고 일관된 피드백을 전달할 수 있어요.',
    image: '/images/value-rocket.png',
  },
  {
    badge: '핵심 가치 3',
    title: 'AI 조교',
    description:
      '피드백 생성, 수업 입력 보조, 학생 분석과 케어 제안, 과제 추적까지 AI 조교가 함께해요.',
    image: '/images/value-target.png',
  },
]

export type StepMedia =
  | { type: 'stack'; top: string; bottom: string; alt: string }
  | { type: 'single'; src: string; alt: string; round?: number }
  | {
      type: 'cluster'
      items: { src: string; slot: 'start' | 'detail' | 'phoneA' | 'phoneB' }[]
      alt: string
    }
  | { type: 'pair'; left: string; right: string; alt: string }
  | { type: 'parent'; phone: string; alt: string }

export type ParentNote = {
  step: string
  title: string
  body: string
}

export type Step = {
  id: string
  step: string
  tab?: string
  title: string
  description: string[]
  media: StepMedia
  textSide?: 'left' | 'right'
  tone?: 'tint' | 'white'
  ellipseSide?: 'left' | 'right'
  notes?: ParentNote[]
}

export const parentDashboardNotes: ParentNote[] = [
  {
    step: 'STEP 1',
    title: '오늘 수업 요약',
    body: '금일 수업과 클리닉 요약이 학생별로 정리되어 보여요.',
  },
  {
    step: 'STEP 2',
    title: '선생님 피드백',
    body: '수업·클리닉 내용을 바탕으로 선생님 피드백이 전달돼요.',
  },
  {
    step: 'STEP 3',
    title: '해야 할 것',
    body: '밀린 과제와 오답이 반·날짜와 함께 표시되고, 완료되면 반영돼요.',
  },
  {
    step: 'STEP 4',
    title: '최근 수업 이력',
    body: '학생이 최근 진행한 수업과 클리닉 이력을 한눈에 볼 수 있어요.',
  },
]

/** 사용법 · Figma 장표 224–231 + 학부모 225 */
export const steps: Step[] = [
  {
    id: 'step-0',
    step: 'STEP 0',
    tab: '학생 · 반 관리',
    title: '먼저 반과 학생을\n등록해 주세요.',
    description: [
      '반 이름을 만들고 학생 정보를 입력하면 끝이에요.',
      '엑셀로 한 번에 업로드할 수도 있어요.',
      '한 번만 등록하면 이후 수업마다 자동으로 연동돼요.',
    ],
    media: {
      type: 'stack',
      top: '/images/steps/step0-a.png',
      bottom: '/images/steps/step0-b.png',
      alt: '반·학생 등록 화면',
    },
    textSide: 'right',
    tone: 'tint',
    ellipseSide: 'left',
  },
  {
    id: 'step-1',
    step: 'STEP 1',
    tab: '수업 템플릿',
    title: '내 수업에 맞는\n템플릿을 만들어 보세요.',
    description: [
      '출결, 점수, 과제 등 필요한 항목을 직접 설정할 수 있어요.',
      '한 번 만들어 두면 매 수업마다 그대로 재사용해요.',
      '문자에 포함할 항목도 여기서 골라 두면 돼요.',
    ],
    media: {
      type: 'single',
      src: '/images/steps/step1.png',
      alt: '수업 템플릿 설정 화면',
      round: 24,
    },
    textSide: 'left',
    tone: 'white',
  },
  {
    id: 'step-2',
    step: 'STEP 2',
    tab: 'AI 조교',
    title: '피드백을 만들 AI 조교를\n설정해 보세요.',
    description: [
      '학생 수업 데이터를 바탕으로 학부모 피드백을 자동으로 생성해요.',
      '말투, 길이, 포함할 내용까지 원하는 방향으로 맞춰 둘 수 있어요.',
    ],
    media: {
      type: 'single',
      src: '/images/steps/step2-media.png',
      alt: 'AI 조교 설정 화면',
      round: 20,
    },
    textSide: 'right',
    tone: 'white',
    ellipseSide: 'left',
  },
  {
    id: 'step-3',
    step: 'STEP 3',
    tab: '수업 입력',
    title: '수업 시작 전에\n출결을 시작해 보세요.',
    description: [
      '설정해 둔 시간에 맞춰 출결이 시작돼요.',
      '학생에게 출결 링크가 알림톡으로 발송돼요.',
    ],
    media: {
      type: 'cluster',
      alt: '출결 시작 화면',
      items: [
        { src: '/images/steps/step3-start.png', slot: 'start' },
        { src: '/images/steps/step3-detail.png', slot: 'detail' },
        { src: '/images/steps/step3-phone-a.png', slot: 'phoneA' },
        { src: '/images/steps/step3-phone-b.png', slot: 'phoneB' },
      ],
    },
    textSide: 'left',
    tone: 'white',
    ellipseSide: 'right',
  },
  {
    id: 'step-4',
    step: 'STEP 4',
    tab: '수업 입력',
    title: '수업이 끝나면\n데이터를 입력해 보세요.',
    description: [
      '날짜 선택 → 반 선택 → 항목 입력, 이 순서면 끝이에요.',
      '저장하면 학생별 문자 내용이 자동으로 만들어져요.',
      '엑셀로 출력해 바로 발송할 수도 있어요.',
    ],
    media: {
      type: 'single',
      src: '/images/steps/step4.png',
      alt: '수업 데이터 입력 화면',
      round: 15,
    },
    textSide: 'right',
    tone: 'white',
  },
  {
    id: 'step-5',
    step: 'STEP 5',
    tab: '수업 입력',
    title: '버튼 하나로\n알림톡을 발송해 보세요.',
    description: [
      '설정해 둔 대로 알림톡이 발송되고, 학부모 대시보드 링크도 함께 전달돼요.',
      '대시보드에는 AI 피드백, 수업 이력, 미완료 항목이 함께 보여요.',
    ],
    media: {
      type: 'pair',
      left: '/images/steps/step5-kakao.png',
      right: '/images/steps/step5-dash.png',
      alt: '알림톡 발송과 학부모 대시보드',
    },
    textSide: 'right',
    tone: 'white',
  },
  {
    id: 'parent-dashboard',
    step: '학부모',
    tab: '학부모 대시보드',
    title: '학부모가 받는 화면을\n확인해 보세요.',
    description: [],
    media: {
      type: 'parent',
      phone: '/images/steps/parent-phone.png',
      alt: '학부모 대시보드',
    },
    textSide: 'right',
    tone: 'tint',
    ellipseSide: 'left',
    notes: parentDashboardNotes,
  },
  {
    id: 'step-6',
    step: 'STEP 6',
    tab: '학생 대시보드',
    title: '놓친 학생이 없는지,\n성취도를 확인해 보세요.',
    description: [
      '미완료 항목, 점수 추이, 수업 이력을 한곳에서 확인할 수 있어요.',
      '미완료 항목은 페이지에서 바로 완료 처리하면 즉시 반영돼요.',
      'AI 조교가 학생을 분석해 케어 포인트도 제안해 줘요.',
    ],
    media: {
      type: 'single',
      src: '/images/steps/step6.png',
      alt: '학생 대시보드 화면',
      round: 32,
    },
    textSide: 'left',
    tone: 'tint',
    ellipseSide: 'right',
  },
]

/** 히어로 슬라이드 — STEP 0~6 미디어 묶음 (학부모 제외, 7세트) */
export const heroSlides = steps
  .filter((step) => step.id.startsWith('step-'))
  .map((step) => ({
    id: step.id,
    media: step.media,
    alt: step.media.alt,
    step: step.step,
    tab: step.tab ?? step.step,
  }))
