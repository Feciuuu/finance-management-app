'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Briefcase, Calendar, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface PublicProfileProps {
  user: {
    id: string
    name: string
    username: string | null
    image: string | null
    bio: string | null
    occupation: string | null
    createdAt: Date
  }
}

export function PublicProfileView({ user }: PublicProfileProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Powrot
          </Link>
          <Link href="/sign-in">
            <Button variant="outline" size="sm">
              Zaloguj sie
            </Button>
          </Link>
        </div>
      </header>

      {/* Profile Content */}
      <main className="mx-auto max-w-4xl px-4 py-12">
        <Card className="border-border bg-card p-8">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <Avatar className="h-32 w-32 border-4 border-border">
              <AvatarImage src={user.image ?? undefined} alt={user.name} />
              <AvatarFallback className="bg-secondary text-4xl">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Name and Username */}
            <h1 className="mt-6 text-3xl font-bold">{user.name}</h1>
            {user.username && (
              <p className="mt-1 text-lg text-muted-foreground">@{user.username}</p>
            )}

            {/* Occupation */}
            {user.occupation && (
              <Badge variant="secondary" className="mt-4 gap-1.5">
                <Briefcase className="h-3.5 w-3.5" />
                {user.occupation}
              </Badge>
            )}

            {/* Bio */}
            {user.bio && (
              <p className="mt-6 max-w-lg text-muted-foreground leading-relaxed">
                {user.bio}
              </p>
            )}

            {/* Member Since */}
            <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Dolaczyl {new Date(user.createdAt).toLocaleDateString('pl-PL', {
                  year: 'numeric',
                  month: 'long',
                })}
              </span>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
