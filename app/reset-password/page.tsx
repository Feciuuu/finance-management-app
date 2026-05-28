import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { ResetPasswordForm } from '@/components/reset-password-form'

export const metadata = {
  title: 'Nowe haslo - FinanceApp',
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect('/dashboard')

  const { token, error } = await searchParams

  return <ResetPasswordForm token={token} error={error} />
}
