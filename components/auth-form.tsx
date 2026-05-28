'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { BarChart3, ArrowLeft, Loader2 } from 'lucide-react'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [loginIdentifier, setLoginIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isSignUp = mode === 'sign-up'

  const checkAvailability = async (field: 'email' | 'username', value: string) => {
    if (!value) return true
    try {
      const res = await fetch(`/api/check-availability?${field}=${encodeURIComponent(value)}`)
      const data = await res.json()
      return data.available
    } catch {
      return true
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (isSignUp) {
      const emailAvailable = await checkAvailability('email', email)
      if (!emailAvailable) {
        setError('Ten adres email jest juz zajety')
        setLoading(false)
        return
      }

      if (username) {
        const usernameAvailable = await checkAvailability('username', username)
        if (!usernameAvailable) {
          setError('Ta nazwa uzytkownika jest juz zajeta')
          setLoading(false)
          return
        }
      }

      const { error } = await authClient.signUp.email({
        email,
        password,
        name,
        username: username || undefined,
      })

      setLoading(false)

      if (error) {
        setError(error.message ?? 'Cos poszlo nie tak')
        return
      }
    } else {
      const isEmail = loginIdentifier.includes('@')
      
      const { error } = await authClient.signIn.email({
        email: isEmail ? loginIdentifier : `${loginIdentifier}@placeholder.temp`,
        password,
      })

      if (error && !isEmail) {
        try {
          const res = await fetch(`/api/get-email-by-username?username=${encodeURIComponent(loginIdentifier)}`)
          const data = await res.json()
          
          if (data.email) {
            const { error: retryError } = await authClient.signIn.email({
              email: data.email,
              password,
            })
            
            if (retryError) {
              setError(retryError.message ?? 'Nieprawidlowe dane logowania')
              setLoading(false)
              return
            }
          } else {
            setError('Nieprawidlowe dane logowania')
            setLoading(false)
            return
          }
        } catch {
          setError('Nieprawidlowe dane logowania')
          setLoading(false)
          return
        }
      } else if (error) {
        setError(error.message ?? 'Nieprawidlowe dane logowania')
        setLoading(false)
        return
      }
      
      setLoading(false)
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="min-h-svh bg-background flex flex-col">
      {/* Back button */}
      <div className="p-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Powrot
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
              {isSignUp ? 'Stworz konto' : 'Witaj ponownie'}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isSignUp
                ? 'Zarejestruj sie, aby rozpoczac'
                : 'Zaloguj sie na swoje konto'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isSignUp && (
              <>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Imie
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                    placeholder="Jan Kowalski"
                    className="h-11 bg-input"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="username" className="text-sm font-medium">
                    Nazwa uzytkownika
                  </Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    placeholder="jankowalski (opcjonalnie)"
                    className="h-11 bg-input"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
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
              </>
            )}
            
            {!isSignUp && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="loginIdentifier" className="text-sm font-medium">
                  Email lub nazwa uzytkownika
                </Label>
                <Input
                  id="loginIdentifier"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder="jan@przyklad.pl lub jankowalski"
                  className="h-11 bg-input"
                />
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Haslo
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                placeholder="Minimum 8 znakow"
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
                  Prosze czekac...
                </>
              ) : isSignUp ? (
                'Stworz konto'
              ) : (
                'Zaloguj sie'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isSignUp ? 'Masz juz konto? ' : 'Nie masz konta? '}
              <Link
                href={isSignUp ? '/sign-in' : '/sign-up'}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {isSignUp ? 'Zaloguj sie' : 'Zarejestruj sie'}
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </main>
  )
}
