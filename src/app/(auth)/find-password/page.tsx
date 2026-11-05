import { redirect } from 'next/navigation'

/** 비밀번호 찾기는 막아 둔다. 주소로 들어와도 로그인으로 보낸다. */
export default function FindPasswordPage() {
  redirect('/login')
}
