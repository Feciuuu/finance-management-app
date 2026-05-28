'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { BarChart3, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export function ResetPasswordForm({
  token,
  error: tokenError,
}: {
  token?: string
  error?: string
}) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!token || tokenError) {
    return (
      <main className="min-h-svh bg-background flex flex-col items-center justify-center px-4">
        <Card className="w-full max-w-sm border-border bg-card p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-xl font-semibold mb-2">Link jest nieprawidlowy</h1>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Ten link do resetowania hasla jest nieprawidlowy lub wygasl. Sprobuj ponownie wyslic prosbe o reset.
          </p>
          <Button asChild className="w-full h-11">
            <Link href="/forgot-password">Wyslij nowy link</Link>
          </Button>
        </Card>
      </main>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Hasla nie sa identyczne')
      return
    }

    if (password.length < 8) {
      setError('Haslo musi miec co najmniej 8 znakow')
      return
    }

    setLoading(true)

    const { error } = await authClient.resetPassword({
      newPassword: password,
      token,
    })

    setLoading(false)

    if (error) {
      setError('Cos poszlo nie tak. Link mogl wygasnac.')
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/sign-in'), 3000)
  }

  if (success) {
    return (
      <main className="min-h-svh bg-background flex flex-col items-center justify-center px-4">
        <Card className="w-full max-w-sm border-border bg-card p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="text-xl font-semibold mb-2">Haslo zostalo zmienione!</h1>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Twoje haslo zostalo pomyslnie zaktualizowane. Za chwile zostaniesz przekierowany do strony logowania.
          </p>
          <Button asChild className="w-full h-11">
            <Link href="/sign-in">Zaloguj sie</Link>
          </Button>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-svh bg-background flex flex-col">
      <div className="p-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/sign-in">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Powrot do logowania
          </Link>
        </Button>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <Card className="w-full max-w-sm border-border bg-card p-8">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground">
              <BarChart3 className="h-7 w-7 text-background" />
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight">
              Nowe haslo
            </h1>
            <p className="mt-1 text-sm text-muted-foreground text-center">
              Ustaw nowe haslo do swojego konta
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Nowe haslo
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Minimum 8 znakow"
                className="h-11 bg-input"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="confirm" className="text-sm font-medium">
                Potwierdz haslo
              </Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Powtórz haslo"
                className="h-11 bg-input"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive" role="alert">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="mt-2 h-11 w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Zapisywanie...
                </>
              ) : (
                'Zmien haslo'
              )}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  )
}
