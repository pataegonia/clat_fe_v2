'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { auth } from '@/services/auth'
import { PendingApprovalModal } from '@/components/auth/PendingApprovalModal'
import {
  containerStyle,
  loginBoxStyle,
  logoSectionStyle,
  formStyle,
  submitButtonStyle,
  footerLinkStyle,
  footerLinkAnchorStyle,
} from '../login/login.css'
import Input from '@/components/common/Input/Input'
import Button from '@/components/common/Button/Button'
import Text from '@/components/common/Text/Text'
import Logo from '@/assets/logo/logo-full.svg'
import { colors } from '@/styles/tokens/colors'
import { formatPhoneInput, normalizeKoreanMobile } from '@/lib/phone'

const MIN_PASSWORD_LEN = 8

function SignupContent() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')

  const router = useRouter()
  const passwordConfirmRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingOpen, setPendingOpen] = useState(false)

  const passwordsMismatch =
    passwordConfirm.length > 0 && password !== passwordConfirm
  const passwordTooShort = password.length > 0 && password.length < MIN_PASSWORD_LEN

  const normalizedPhone = normalizeKoreanMobile(phone)
  const canSubmit =
    name.trim().length > 0 &&
    normalizedPhone != null &&
    email.length > 0 &&
    password.length >= MIN_PASSWORD_LEN &&
    password === passwordConfirm &&
    !isLoading

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      passwordConfirmRef.current?.focus()
      return
    }
    if (password.length < MIN_PASSWORD_LEN) {
      setError(`비밀번호는 ${MIN_PASSWORD_LEN}자 이상이어야 합니다.`)
      return
    }
    if (!normalizedPhone) {
      setError('전화번호는 010으로 시작하는 휴대폰 번호여야 합니다.')
      return
    }

    setIsLoading(true)
    try {
      await auth.signup({
        email: email.trim(),
        password,
        name: name.trim(),
        phone: normalizedPhone ?? '',
      })
      setPendingOpen(true)
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: { message?: string }; message?: string } } }
      const message =
        ax.response?.data?.error?.message ??
        ax.response?.data?.message ??
        '회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={containerStyle}>
      <div className={loginBoxStyle}>
        <div className={logoSectionStyle}>
          <Logo height={80} style={{ width: 'auto' }} />
          <Text variant="headingMd" color="gray500">
            학원 강사 행정 자동화 AI 수업 운영 플랫폼
          </Text>
        </div>

        <form className={formStyle} onSubmit={handleSignup}>
          <Input
            placeholder="이름"
            shape="capsule"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
          <Input
            placeholder="전화번호 (010-0000-0000)"
            shape="capsule"
            value={phone}
            onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
          />
          <Input
            placeholder="이메일"
            shape="capsule"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
          />
          <Input
            placeholder="비밀번호 (8자 이상)"
            shape="capsule"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="new-password"
          />
          <Input
            placeholder="비밀번호 확인"
            shape="capsule"
            ref={passwordConfirmRef}
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            type="password"
            autoComplete="new-password"
          />

          {passwordTooShort && (
            <Text variant="bodyMd" color="error500">
              비밀번호는 {MIN_PASSWORD_LEN}자 이상이어야 합니다.
            </Text>
          )}
          {passwordsMismatch && (
            <Text variant="bodyMd" color="error500">
              비밀번호가 일치하지 않습니다.
            </Text>
          )}

          <Button
            variant="primary"
            size="lg"
            shape="capsule"
            fullWidth
            type="submit"
            className={submitButtonStyle}
            disabled={!canSubmit}
          >
            {isLoading ? '가입 중...' : '회원가입'}
          </Button>

          {error && (
            <Text variant="bodyMd" color="error500">
              {error}
            </Text>
          )}
        </form>

        <div className={footerLinkStyle}>
          <Link href="/login" className={footerLinkAnchorStyle}>
            <Text variant="bodyLg" color="gray300">
              로그인
            </Text>
          </Link>
          <div style={{ width: 1, height: 16, backgroundColor: colors.gray300 }} />
          <Text variant="bodyLg" color="gray300">
            비밀번호 찾기
          </Text>
        </div>
      </div>
      <PendingApprovalModal
        isOpen={pendingOpen}
        onClose={() => {
          setPendingOpen(false)
          router.push('/login')
        }}
      />
    </div>
  )
}

export default function SignupPage() {
  return <SignupContent />
}
