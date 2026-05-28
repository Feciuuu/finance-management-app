'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

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
      // Check email availability
      const emailAvailable = await checkAvailability('email', email)
      if (!emailAvailable) {
        setError('Ten adres email jest juz zajety')
        setLoading(false)
        return
      }

      // Check username availability
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
      // Sign in - determine if identifier is email or username
      const isEmail = loginIdentifier.includes('@')
      
      const { error } = await authClient.signIn.email({
        email: isEmail ? loginIdentifier : `${loginIdentifier}@placeholder.temp`,
        password,
      })

      // If login with username placeholder failed, try actual username lookup
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
    <main className="min-h-svh bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-sm p-6 border-border">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {isSignUp ? 'Stworz konto' : 'Witaj ponownie'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isSignUp
              ? 'Zarejestruj sie, aby rozpoczac'
              : 'Zaloguj sie na swoje konto'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isSignUp && (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Imie</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  className="bg-background"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="username">Nazwa uzytkownika</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  placeholder="Opcjonalnie"
                  className="bg-background"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="bg-background"
                />
              </div>
            </>
          )}
          
          {!isSignUp && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="loginIdentifier">Email lub nazwa uzytkownika</Label>
              <Input
                id="loginIdentifier"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                required
                autoComplete="username"
                className="bg-background"
              />
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Haslo</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              className="bg-background"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading
              ? 'Prosze czekac...'
              : isSignUp
                ? 'Stworz konto'
                : 'Zaloguj sie'}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-6">
          {isSignUp ? 'Masz juz konto? ' : 'Nie masz konta? '}
          <Link
            href={isSignUp ? '/sign-in' : '/sign-up'}
            className="text-foreground font-medium underline-offset-4 hover:underline"
          >
            {isSignUp ? 'Zaloguj sie' : 'Zarejestruj sie'}
          </Link>
        </p>
      </Card>
    </main>
  )
}
