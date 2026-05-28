'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  BarChart3,
  Home,
  Wallet,
  PieChart,
  Users,
  MessageSquare,
  Settings,
  Shield,
  X,
  Menu,
  User,
} from 'lucide-react'
import { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'

interface User {
  id: string
  name: string
  email: string
  image?: string | null
  isAdmin?: boolean
}

interface DashboardSidebarProps {
  user: User
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Transakcje', href: '/dashboard/transactions', icon: Wallet },
  { name: 'Analizy', href: '/dashboard/analytics', icon: PieChart },
  { name: 'Serwery', href: '/dashboard/servers', icon: Users },
  { name: 'Wiadomosci', href: '/dashboard/messages', icon: MessageSquare },
]

const bottomNavigation = [
  { name: 'Profil', href: '/dashboard/profile', icon: User },
  { name: 'Ustawienia', href: '/dashboard/settings', icon: Settings },
]

function SidebarContent({ user, onClose }: { user: User; onClose?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-foreground">
            <BarChart3 className="h-5 w-5 text-sidebar" />
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground">FinanceHub</span>
        </Link>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
            <X className="h-5 w-5" />
            <span className="sr-only">Zamknij menu</span>
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Admin section */}
        {user.isAdmin && (
          <div className="mt-6">
            <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
              Administracja
            </div>
            <Link
              href="/dashboard/admin"
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                pathname === '/dashboard/admin'
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Shield className="h-5 w-5" />
              Panel admina
            </Link>
          </div>
        )}
      </ScrollArea>

      {/* Bottom navigation */}
      <div className="border-t border-sidebar-border px-3 py-4">
        <nav className="flex flex-col gap-1">
          {bottomNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* User info */}
        <div className="mt-4 flex items-center gap-3 rounded-lg bg-sidebar-accent p-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.image ?? undefined} alt={user.name} />
            <AvatarFallback className="bg-sidebar-foreground text-sidebar text-sm">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium text-sidebar-foreground">{user.name}</p>
            <p className="truncate text-xs text-sidebar-foreground/60">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-4 z-40 lg:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Otworz menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Menu nawigacyjne</SheetTitle>
          <SidebarContent user={user} onClose={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <SidebarContent user={user} />
      </aside>
    </>
  )
}
