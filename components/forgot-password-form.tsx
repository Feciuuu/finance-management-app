'use client'

import { useState } from 'react'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { BarChart3, ArrowLeft, Loader2, Mail, CheckCircle } from 'lucide-react'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await authClient.forgetPassword({
      email,
      redirectTo: '/reset-password',
    })

    setLoading(false)

    if (error) {
      setError('Cos poszlo nie tak. Sprawdz czy email jest poprawny.')
      return
    }

    setSent(true)
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
              Zapomniales hasla?
            </h1>
            <p className="mt-1 text-sm text-muted-foreground text-center">
              Podaj swoj adres email, a wyslem Ci link do resetowania hasla
            </p>
          </div>

          {sent ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <p className="font-medium mb-1">Sprawdz swojego maila!</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Wyslalismy link do resetowania hasla na adres{' '}
                  <span className="font-medium text-foreground">{email}</span>.
                  Link wygasnie po godzinie.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3 text-left w-full">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Nie dostales maila? Sprawdz folder spam lub{' '}
                  <button
                    onClick={() => setSent(false)}
                    className="underline underline-offset-4 hover:text-foreground"
                  >
                    sprobuj ponownie
                  </button>
                </p>
              </div>
              <Button asChild className="w-full h-11 mt-2">
                <Link href="/sign-in">Wróc do logowania</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Adres email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="jan@przyklad.pl"
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
                    Wysylanie...
                  </>
                ) : (
                  'Wyslij link resetujacy'
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Pamietasz haslo?{' '}
                <Link
                  href="/sign-in"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  Zaloguj sie
                </Link>
              </p>
            </form>
          )}
        </Card>
      </div>
    </main>
  )
}
