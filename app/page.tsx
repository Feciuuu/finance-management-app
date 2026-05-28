import Link from 'next/link'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { 
  ArrowRight, 
  TrendingUp, 
  PieChart, 
  Shield,
  Users,
  MessageSquare,
  BarChart3
} from 'lucide-react'

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() })

  return (
    <div className="min-h-svh bg-background">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
              <BarChart3 className="h-5 w-5 text-background" />
            </div>
            <span className="text-lg font-semibold tracking-tight">FinanceHub</span>
          </Link>

          <div className="flex items-center gap-3">
            {session?.user ? (
              <Button asChild>
                <Link href="/dashboard">
                  Panel
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/sign-in">Zaloguj sie</Link>
                </Button>
                <Button asChild>
                  <Link href="/sign-up">Stworz konto</Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative pt-16">
        <section className="relative overflow-hidden">
          {/* Background grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
          
          <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-foreground" />
                </span>
                Wersja 1.0 dostepna
              </div>
              
              <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Kontroluj swoje finanse
                <span className="block text-muted-foreground">w jednym miejscu</span>
              </h1>
              
              <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-muted-foreground sm:text-xl">
                Sledz przychody i wydatki, analizuj wykresy, lacz sie ze spolecznoscia i zarzadzaj swoim budzetem jak profesjonalista.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" asChild className="w-full sm:w-auto">
                  <Link href="/sign-up">
                    Rozpocznij za darmo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                  <Link href="/sign-in">Mam juz konto</Link>
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-20 grid grid-cols-2 gap-8 sm:grid-cols-4">
              {[
                { value: '10K+', label: 'Uzytkownicy' },
                { value: '2M+', label: 'Transakcje' },
                { value: '99.9%', label: 'Dostepnosc' },
                { value: '256-bit', label: 'Szyfrowanie' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold tracking-tight sm:text-4xl">{stat.value}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t border-border bg-card/50">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Wszystko czego potrzebujesz
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Kompleksowe narzedzia do zarzadzania finansami, komunikacji i wspolpracy
              </p>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: TrendingUp,
                  title: 'Sledzenie transakcji',
                  description: 'Dodawaj przychody i wydatki, kategoryzuj je i sledz swoj bilans w czasie rzeczywistym.',
                },
                {
                  icon: PieChart,
                  title: 'Wykresy i analizy',
                  description: 'Wizualizuj swoje finanse za pomoca interaktywnych wykresow i szczegolowych raportow.',
                },
                {
                  icon: Shield,
                  title: 'Bezpieczenstwo',
                  description: 'Twoje dane sa chronione szyfrowaniem 256-bit i dwustopniowym uwierzytelnianiem.',
                },
                {
                  icon: Users,
                  title: 'Spolecznosc',
                  description: 'Dolacz do grup, wymieniaj sie doswiadczeniami i ucz sie od innych uzytkownow.',
                },
                {
                  icon: MessageSquare,
                  title: 'Chat grupowy',
                  description: 'Komunikuj sie w czasie rzeczywistym, wysylaj emotki i gify w dedykowanych kanalach.',
                },
                {
                  icon: BarChart3,
                  title: 'Panel kontrolny',
                  description: 'Przegladaj wszystkie kluczowe wskazniki na jednym, przejrzystym dashboardzie.',
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-foreground/20"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                    <feature.icon className="h-6 w-6 text-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-2xl bg-foreground px-6 py-16 sm:px-12 sm:py-20">
              <div className="relative mx-auto max-w-2xl text-center">
                <h2 className="text-balance text-3xl font-bold tracking-tight text-background sm:text-4xl">
                  Gotowy na przejecie kontroli?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-pretty text-background/80">
                  Dolacz do tysiecy uzytkownow, ktorzy juz korzystaja z FinanceHub do zarzadzania swoimi finansami.
                </p>
                <div className="mt-8">
                  <Button size="lg" variant="secondary" asChild>
                    <Link href="/sign-up">
                      Utworz darmowe konto
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-foreground">
                  <BarChart3 className="h-4 w-4 text-background" />
                </div>
                <span className="text-sm font-medium">FinanceHub</span>
              </div>
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} FinanceHub. Wszelkie prawa zastrzezone.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
