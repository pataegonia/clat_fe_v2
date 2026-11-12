import axiosInstance from '@/lib/api/axiosInstance'
import type {
  HwConsentBody,
  HwCreatedLink,
  HwDeleteAllResult,
  HwLessonView,
  HwRecheckResult,
  HwResolveAction,
  HwResolveResult,
  HwStatus,
  HwStudentState,
  HwTemplateSetting,
  HwTemplateSettingBody,
} from '@/types/homeworkPhoto'

/**
 * 사진 숙제 AI 확인(기능 체험 HOMEWORK_PHOTO) 선생님 API.
 * 숙제 칸 값은 이 API들이 쓰지 않는다(수업 표 저장과 기존 완료 처리 API로 쓴다).
 */

/** 사진 한 장을 받아 오는 제한 시간 */
const PHOTO_TIMEOUT_MS = 30_000

export const homeworkPhotoService = {
  /** 쓸 수 있는지·켰는지와 받은 사진 수 */
  async status(): Promise<HwStatus> {
    const { data } = await axiosInstance.get('/homework-photos/status')
    return (data.data ?? data) as HwStatus
  },

  /** 사진 모두 지우기. 기능을 꺼 두어도 된다. */
  async deleteAll(): Promise<HwDeleteAllResult> {
    const { data } = await axiosInstance.delete('/homework-photos')
    return (data.data ?? data) as HwDeleteAllResult
  },

  async getStudent(studentId: number): Promise<HwStudentState> {
    const { data } = await axiosInstance.get(`/students/${studentId}/homework-photo`)
    return (data.data ?? data) as HwStudentState
  },

  /** 동의 기록·철회 */
  async setConsent(studentId: number, body: HwConsentBody): Promise<HwStudentState> {
    const { data } = await axiosInstance.put(`/students/${studentId}/homework-photo/consent`, body)
    return (data.data ?? data) as HwStudentState
  },

  /** 링크 만들기(이전 링크는 끊긴다). 토큰은 이 응답에서 한 번만 온다. */
  async createLink(studentId: number): Promise<HwCreatedLink> {
    const { data } = await axiosInstance.post(`/students/${studentId}/homework-photo/link`)
    return (data.data ?? data) as HwCreatedLink
  },

  async revokeLink(studentId: number): Promise<HwStudentState> {
    const { data } = await axiosInstance.delete(`/students/${studentId}/homework-photo/link`)
    return (data.data ?? data) as HwStudentState
  },

  async getTemplateSetting(templateId: number): Promise<HwTemplateSetting> {
    const { data } = await axiosInstance.get(`/templates/${templateId}/homework-photo`)
    return (data.data ?? data) as HwTemplateSetting
  },

  /** 숙제 항목·숙제 범위 항목 정하기. 두 값 모두 보낸다(null은 고르지 않음). */
  async setTemplateSetting(
    templateId: number,
    body: HwTemplateSettingBody
  ): Promise<HwTemplateSetting> {
    const { data } = await axiosInstance.put(`/templates/${templateId}/homework-photo`, body)
    return (data.data ?? data) as HwTemplateSetting
  },

  async getLesson(lessonId: number): Promise<HwLessonView> {
    const { data } = await axiosInstance.get(`/lessons/${lessonId}/homework-photos`)
    return (data.data ?? data) as HwLessonView
  },

  /** 처리 여러 건(건마다 ok/code가 따로 온다) */
  async resolve(lessonId: number, actions: HwResolveAction[]): Promise<HwResolveResult> {
    const { data } = await axiosInstance.post(`/lessons/${lessonId}/homework-photos/resolve`, {
      actions,
    })
    return (data.data ?? data) as HwResolveResult
  },

  /** AI 다시 확인 */
  async recheck(submissionId: string): Promise<HwRecheckResult> {
    const { data } = await axiosInstance.post(
      `/homework-photos/submissions/${encodeURIComponent(submissionId)}/recheck`
    )
    return (data.data ?? data) as HwRecheckResult
  },

  /**
   * 사진 한 장(JPEG). 응답을 감싸지 않으므로 blob으로 받는다.
   * 실패하면 error.response.data도 Blob이라 서버 메시지를 꺼내지 않고 정해 둔 문구를 보인다.
   */
  async photoBlob(assetId: string): Promise<Blob> {
    const res = await axiosInstance.get(`/homework-photos/assets/${encodeURIComponent(assetId)}`, {
      responseType: 'blob',
      timeout: PHOTO_TIMEOUT_MS,
    })
    return res.data as Blob
  },
}
