import Link from 'next/link'
import { BarChart3, CheckCircle, Mail, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export const metadata = {
  title: 'Konto utworzone - FinanceApp',
}

export default function SignUpSuccessPage() {
  return (
    <main className="min-h-svh bg-background flex flex-col items-center justify-center px-4">
      <Card className="w-full max-w-sm border-border bg-card p-8 text-center">
        {/* Logo */}
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground mx-auto mb-4">
          <BarChart3 className="h-7 w-7 text-background" />
        </div>

        {/* Success icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 mx-auto mb-6">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight mb-2">
          Konto zostalo utworzone!
        </h1>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Witaj w FinanceApp! Twoje konto jest gotowe. Wyslalismy Ci maila powitalnego z podsumowaniem.
        </p>

        {/* Email reminder */}
        <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-4 mb-6 text-left">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Mail className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Sprawdz swojego maila</p>
            <p className="text-xs text-muted-foreground">
              Wyslalismy Ci wiadomosc powitalna z informacjami o koncie
            </p>
          </div>
        </div>

        <Button asChild className="w-full h-11">
          <Link href="/sign-in">
            Zaloguj sie teraz
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>

        <p className="text-xs text-muted-foreground mt-4">
          Masz problem?{' '}
          <Link href="/sign-up" className="underline underline-offset-4 hover:text-foreground">
            Wróc do rejestracji
          </Link>
        </p>
      </Card>
    </main>
  )
}
