'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Plus,
  Users,
  Crown,
  Shield,
  MessageSquare,
  Search,
  Loader2,
  VolumeX,
} from 'lucide-react'
import { createServer } from '@/app/actions/servers'
import { toast } from 'sonner'

interface Server {
  id: number
  name: string
  description: string | null
  image: string | null
  ownerId: string
  createdAt: Date
  role: string
  isMuted: boolean
}

interface User {
  id: string
  name: string
  email: string
  image: string | null
}

interface ServersPageProps {
  servers: Server[]
  allUsers: User[]
  currentUserId: string
}

export function ServersPage({ servers, allUsers, currentUserId }: ServersPageProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const filteredServers = servers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreateServer = async (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const result = await createServer({
        name,
        description: description || null,
      })

      if (result.success) {
        toast.success('Serwer utworzony')
        setIsCreateOpen(false)
        setName('')
        setDescription('')
        router.refresh()
      } else {
        toast.error(result.error || 'Cos poszlo nie tak')
      }
    })
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-3 w-3 text-yellow-500" />
      case 'moderator':
        return <Shield className="h-3 w-3 text-blue-400" />
      default:
        return null
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Wlasciciel'
      case 'moderator':
        return 'Moderator'
      default:
        return 'Czlonek'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Serwery</h1>
          <p className="text-muted-foreground">Dolacz do grup i komunikuj sie z innymi</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Utworz serwer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Utworz nowy serwer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateServer} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="serverName">Nazwa serwera</Label>
                <Input
                  id="serverName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="np. Moja grupa"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serverDescription">Opis (opcjonalnie)</Label>
                <Textarea
                  id="serverDescription"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="O czym jest ten serwer..."
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Utworz serwer
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="border-border bg-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Szukaj serwerow..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Servers Grid */}
      {filteredServers.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServers.map((server) => (
            <Link key={server.id} href={`/dashboard/servers/${server.id}`}>
              <Card className="group h-full border-border bg-card p-5 transition-colors hover:border-foreground/20">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={server.image ?? undefined} alt={server.name} />
                    <AvatarFallback className="bg-secondary text-lg">
                      {server.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-semibold group-hover:text-foreground">
                        {server.name}
                      </h3>
                      {server.isMuted && (
                        <VolumeX className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    {server.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {server.description}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      <Badge variant="outline" className="gap-1">
                        {getRoleIcon(server.role)}
                        {getRoleLabel(server.role)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="border-border bg-card p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Brak serwerow</h3>
            <p className="mt-2 text-muted-foreground">
              {search
                ? 'Nie znaleziono serwerow o tej nazwie'
                : 'Nie nalezysz do zadnego serwera. Utworz pierwszy!'}
            </p>
            {!search && (
              <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Utworz serwer
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
