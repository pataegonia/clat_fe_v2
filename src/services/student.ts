import axiosInstance from '@/lib/api/axiosInstance'
import type { Student, StudentDetail } from '@/types/student'
import { leaveReasonPayload, type LeaveReasonValue } from '@/types/leaveReason'

export type { StudentClass } from '@/types/student'

export interface CreateStudentDto {
  name: string
  phone?: string
  parent_phone?: string
  parent_phone_2?: string
  school_name?: string
  grade?: string
  class_ids?: number[]
}

export interface UpdateStudentDto {
  name?: string
  phone?: string
  parent_phone?: string
  parent_phone_2?: string
  school_name?: string
  grade?: string
  memo?: string
  class_ids?: number[]
}

export interface StudentListResponse {
  data: Student[]
  meta: { total: number }
}

export interface BulkCreateStudentDto {
  name: string
  phone: string
  parent_phone: string
  school_name: string
}

export interface BulkUploadResult {
  success_count: number
  fail_count: number
  errors: Array<{ row: number; reason: string }>
}

export const studentService = {
  async getStudents(params?: { search?: string; school?: string }): Promise<StudentListResponse> {
    const { data } = await axiosInstance.get('/students', { params })
    return data.data
  },

  async getStudent(id: number): Promise<StudentDetail> {
    const { data } = await axiosInstance.get(`/students/${id}`)
    return data.data
  },

  async openParentDashboard(id: number): Promise<{ token: string }> {
    const { data } = await axiosInstance.post(`/students/${id}/parent-view`)
    return data.data as { token: string }
  },

  async createStudent(dto: CreateStudentDto): Promise<Student> {
    const { data } = await axiosInstance.post('/students', dto)
    return data.data
  },

  async updateStudent(id: number, dto: UpdateStudentDto): Promise<Student> {
    const { data } = await axiosInstance.put(`/students/${id}`, dto)
    return data.data
  },

  async deleteStudent(id: number, leaveReason?: LeaveReasonValue): Promise<void> {
    await axiosInstance.delete(`/students/${id}`, { params: leaveReasonPayload(leaveReason) })
  },

  async bulkDeleteStudents(
    ids: number[],
    leaveReason?: LeaveReasonValue,
  ): Promise<{ deleted_count: number }> {
    const { data } = await axiosInstance.post('/students/bulk-delete', {
      ids,
      ...leaveReasonPayload(leaveReason),
    })
    return data.data as { deleted_count: number }
  },

  async completeItem(
    itemId: number,
    source: 'template' | 'adhoc' = 'template',
  ): Promise<void> {
    await axiosInstance.patch(`/lesson-student-data/${itemId}/complete`, {
      is_completed: true,
      source,
    })
  },

  async bulkCreateStudents(file: File): Promise<BulkUploadResult> {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await axiosInstance.post('/students/bulk', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.data as BulkUploadResult
  },
}
