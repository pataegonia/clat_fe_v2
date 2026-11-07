import axiosInstance from '@/lib/api/axiosInstance'
import type { Student } from '@/types/student'
import { leaveReasonPayload, type LeaveReasonValue } from '@/types/leaveReason'

export interface ClassSchedule {
  day_of_week: number
}

export interface Class {
  id: number
  academy_name: string
  name: string
  schedules: ClassSchedule[]
  student_count: number
  ended_at: string | null
}

export interface ClassDetail extends Class {
  status: '진행 중' | '종료'
  templates: { id: number; name: string }[]
  students: Student[]
}

export interface ClassListResponse {
  data: Class[]
  meta: { total: number }
}

export interface CreateClassDto {
  academy_name: string
  name: string
  day_of_week: number[]
}

export interface UpdateClassDto {
  academy_name?: string
  name?: string
  day_of_week?: number[]
}

export const classService = {
  // 목록 조회
  async getClasses(params?: { status?: 'active' | 'ended' }): Promise<ClassListResponse> {
    const { data } = await axiosInstance.get('/classes', { params })
    return data.data
  },

  // 상세 조회
  async getClass(id: number): Promise<ClassDetail> {
    const { data } = await axiosInstance.get(`/classes/${id}`)
    return data.data
  },

  // 생성
  async createClass(dto: CreateClassDto): Promise<Class> {
    const { data } = await axiosInstance.post('/classes', dto)
    return data.data
  },

  // 수정
  async updateClass(id: number, dto: UpdateClassDto): Promise<Class> {
    const { data } = await axiosInstance.put(`/classes/${id}`, dto)
    return data.data
  },

  // 삭제
  async deleteClass(id: number): Promise<void> {
    await axiosInstance.delete(`/classes/${id}`)
  },

  // 종료
  async endClass(id: number, ended_at?: string): Promise<void> {
    await axiosInstance.post(`/classes/${id}/end`, { ended_at })
  },

  // 소속 학생 목록 조회
  async getClassStudents(id: number, date?: string): Promise<Student[]> {
    const { data } = await axiosInstance.get(`/classes/${id}/students`, {
      params: date ? { date } : undefined,
    })
    return data.data.data
  },

  // 학생 추가
  async addStudents(id: number, student_ids: number[]): Promise<void> {
    await axiosInstance.post(`/classes/${id}/students`, { student_ids })
  },

  // 학생 제거 (사유는 선택)
  async removeStudent(
    classId: number,
    studentId: number,
    leaveReason?: LeaveReasonValue,
  ): Promise<void> {
    await axiosInstance.delete(`/classes/${classId}/students/${studentId}`, {
      params: leaveReasonPayload(leaveReason),
    })
  },
}
