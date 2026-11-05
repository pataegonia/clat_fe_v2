'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { auth } from '@/services/auth'
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

export default function FindPasswordPage() {
  const router = useRouter()
  const passwordConfirmRef = useRef<HTMLInputElement>(null)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const passwordsMismatch = passwordConfirm.length > 0 && password !== passwordConfirm
  const passwordTooShort = password.length > 0 && password.length < MIN_PASSWORD_LEN
  const normalizedPhone = normalizeKoreanMobile(phone)
  const canSubmit =
    email.trim().length > 0 &&
    normalizedPhone != null &&
    password.length >= MIN_PASSWORD_LEN &&
    password === passwordConfirm &&
    !isLoading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!normalizedPhone) {
      setError('전화번호는 010으로 시작하는 휴대폰 번호여야 합니다.')
      return
    }
    if (password.length < MIN_PASSWORD_LEN) {
      setError(`비밀번호는 ${MIN_PASSWORD_LEN}자 이상이어야 합니다.`)
      return
    }
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      passwordConfirmRef.current?.focus()
      return
    }

    setIsLoading(true)
    try {
      await auth.resetPassword({
        email: email.trim(),
        phone: normalizedPhone,
        new_password: password,
      })
      setDone(true)
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: { message?: string }; message?: string } } }
      setError(
        ax.response?.data?.error?.message ??
          ax.response?.data?.message ??
          '비밀번호를 바꾸지 못했어요. 잠시 후 다시 시도해 주세요.',
      )
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
            가입할 때 쓴 이메일과 전화번호로 새 비밀번호를 정해요
          </Text>
        </div>

        {done ? (
          <div className={formStyle}>
            <Text variant="bodyLg" color="gray700">
              비밀번호를 바꿨어요. 새 비밀번호로 로그인해 주세요.
            </Text>
            <Button
              variant="primary"
              size="lg"
              shape="capsule"
              fullWidth
              type="button"
              className={submitButtonStyle}
              onClick={() => router.push('/login')}
            >
              로그인하기
            </Button>
          </div>
        ) : (
          <form className={formStyle} onSubmit={handleSubmit}>
            <Input
              placeholder="이메일"
              shape="capsule"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
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
              placeholder="새 비밀번호 (8자 이상)"
              shape="capsule"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
            />
            <Input
              placeholder="새 비밀번호 확인"
              shape="capsule"
              ref={passwordConfirmRef}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              type="password"
              autoComplete="new-password"
            />
            {passwordTooShort && (
              <Text variant="bodyMd" color="error500">
                비밀번호는 8자 이상이어야 합니다.
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
              {isLoading ? '바꾸는 중...' : '비밀번호 바꾸기'}
            </Button>
            {error && (
              <Text variant="bodyMd" color="error500">
                {error}
              </Text>
            )}
          </form>
        )}

        <div className={footerLinkStyle}>
          <Link href="/login" className={footerLinkAnchorStyle}>
            <Text variant="bodyLg" color="gray300">
              로그인
            </Text>
          </Link>
          <div style={{ width: 1, height: 16, backgroundColor: colors.gray300 }} />
          <Link href="/signup" className={footerLinkAnchorStyle}>
            <Text variant="bodyLg" color="gray300">
              회원가입
            </Text>
          </Link>
        </div>
      </div>
    </div>
  )
}
