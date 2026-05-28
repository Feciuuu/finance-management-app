'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Search,
  MoreHorizontal,
  Shield,
  ShieldOff,
  Trash2,
  Users,
  UserPlus,
  Loader2,
} from 'lucide-react'
import { toggleAdmin, deleteUser } from '@/app/actions/admin'
import { toast } from 'sonner'

interface User {
  id: string
  name: string
  email: string
  username: string | null
  image: string | null
  isAdmin: boolean
  isPublic: boolean
  createdAt: Date
}

interface AdminPageProps {
  users: User[]
  currentUserId: string
}

export function AdminPage({ users, currentUserId }: AdminPageProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const filteredUsers = users.filter((u) => {
    const searchLower = search.toLowerCase()
    return (
      u.name.toLowerCase().includes(searchLower) ||
      u.email.toLowerCase().includes(searchLower) ||
      (u.username?.toLowerCase().includes(searchLower) ?? false)
    )
  })

  const adminCount = users.filter((u) => u.isAdmin).length
  const totalUsers = users.length

  const handleToggleAdmin = async (userId: string, currentIsAdmin: boolean) => {
    startTransition(async () => {
      const result = await toggleAdmin(userId, !currentIsAdmin)
      if (result.success) {
        toast.success(currentIsAdmin ? 'Uprawnienia admina odebrane' : 'Uprawnienia admina nadane')
        router.refresh()
      } else {
        toast.error(result.error || 'Cos poszlo nie tak')
      }
    })
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    startTransition(async () => {
      const result = await deleteUser(userToDelete.id)
      if (result.success) {
        toast.success('Uzytkownik usuniety')
        setDeleteDialogOpen(false)
        setUserToDelete(null)
        router.refresh()
      } else {
        toast.error(result.error || 'Cos poszlo nie tak')
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Panel administracyjny</h1>
        <p className="text-muted-foreground">Zarzadzaj uzytkownikami i uprawnieniami</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border bg-card p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Wszyscy uzytkownicy</p>
              <p className="text-2xl font-bold">{totalUsers}</p>
            </div>
          </div>
        </Card>
        <Card className="border-border bg-card p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Administratorzy</p>
              <p className="text-2xl font-bold">{adminCount}</p>
            </div>
          </div>
        </Card>
        <Card className="border-border bg-card p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
              <UserPlus className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nowi (30 dni)</p>
              <p className="text-2xl font-bold">
                {users.filter((u) => {
                  const thirtyDaysAgo = new Date()
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                  return new Date(u.createdAt) > thirtyDaysAgo
                }).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-border bg-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Szukaj uzytkownikow po imieniu, emailu lub nazwie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Users Table */}
      <Card className="border-border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Uzytkownik</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data rejestracji</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <TableRow key={u.id} className="border-border">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={u.image ?? undefined} alt={u.name} />
                          <AvatarFallback className="bg-secondary text-sm">
                            {u.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{u.name}</p>
                          {u.username && (
                            <p className="text-sm text-muted-foreground">@{u.username}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {u.isAdmin && (
                          <Badge variant="secondary" className="gap-1">
                            <Shield className="h-3 w-3" />
                            Admin
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {u.isPublic ? 'Publiczny' : 'Prywatny'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString('pl-PL')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={isPending}>
                            {isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                            <span className="sr-only">Akcje</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {u.id !== currentUserId && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleToggleAdmin(u.id, u.isAdmin)}
                              >
                                {u.isAdmin ? (
                                  <>
                                    <ShieldOff className="mr-2 h-4 w-4" />
                                    Odbierz admina
                                  </>
                                ) : (
                                  <>
                                    <Shield className="mr-2 h-4 w-4" />
                                    Nadaj admina
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setUserToDelete(u)
                                  setDeleteDialogOpen(true)
                                }}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Usun uzytkownika
                              </DropdownMenuItem>
                            </>
                          )}
                          {u.id === currentUserId && (
                            <DropdownMenuItem disabled>
                              To Twoje konto
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    Brak uzytkownikow spelniajacych kryteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunac tego uzytkownika?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta akcja jest nieodwracalna. Wszystkie dane uzytkownika{' '}
              <span className="font-medium">{userToDelete?.name}</span> ({userToDelete?.email})
              zostana trwale usuniete.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Usun
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
