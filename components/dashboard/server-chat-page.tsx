'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Users,
  Settings,
  Send,
  Crown,
  Shield,
  MoreHorizontal,
  UserPlus,
  Trash2,
  Ban,
  VolumeX,
  Volume2,
  Loader2,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react'
import {
  sendMessage,
  deleteMessage,
  addMember,
  removeMember,
  updateMemberRole,
  toggleMute,
  banMember,
  deleteServer,
} from '@/app/actions/servers'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface User {
  id: string
  name: string
  email: string
  image: string | null
}

interface Member extends User {
  role: string
  isMuted: boolean
  isBanned: boolean
}

interface Message {
  id: number
  content: string
  imageUrl: string | null
  serverId: number
  userId: string
  createdAt: Date
  user: User
}

interface Server {
  id: number
  name: string
  description: string | null
  image: string | null
  ownerId: string
}

interface ServerChatPageProps {
  server: Server
  members: Member[]
  messages: Message[]
  currentUserId: string
  currentUserRole: string
  isMuted: boolean
}

export function ServerChatPage({
  server,
  members,
  messages: initialMessages,
  currentUserId,
  currentUserRole,
  isMuted,
}: ServerChatPageProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [messages, setMessages] = useState(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [membersOpen, setMembersOpen] = useState(false)
  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const isOwner = currentUserRole === 'owner'
  const isModerator = currentUserRole === 'moderator' || isOwner

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isMuted) return

    const content = newMessage
    setNewMessage('')

    startTransition(async () => {
      const result = await sendMessage(server.id, content)
      if (result.success) {
        router.refresh()
      } else {
        toast.error(result.error || 'Nie udalo sie wyslac wiadomosci')
        setNewMessage(content)
      }
    })
  }

  const handleDeleteMessage = async (messageId: number) => {
    startTransition(async () => {
      const result = await deleteMessage(messageId)
      if (result.success) {
        setMessages((prev) => prev.filter((m) => m.id !== messageId))
        toast.success('Wiadomosc usunieta')
      } else {
        toast.error(result.error || 'Nie udalo sie usunac wiadomosci')
      }
    })
  }

  const handleAddMember = async () => {
    if (!selectedUserId) return

    startTransition(async () => {
      const result = await addMember(server.id, selectedUserId)
      if (result.success) {
        toast.success('Uzytkownik dodany')
        setAddMemberOpen(false)
        setSelectedUserId('')
        router.refresh()
      } else {
        toast.error(result.error || 'Nie udalo sie dodac uzytkownika')
      }
    })
  }

  const handleRemoveMember = async (userId: string) => {
    startTransition(async () => {
      const result = await removeMember(server.id, userId)
      if (result.success) {
        toast.success('Uzytkownik usuniety')
        router.refresh()
      } else {
        toast.error(result.error || 'Nie udalo sie usunac uzytkownika')
      }
    })
  }

  const handleToggleMute = async (userId: string, currentlyMuted: boolean) => {
    startTransition(async () => {
      const result = await toggleMute(server.id, userId, !currentlyMuted)
      if (result.success) {
        toast.success(currentlyMuted ? 'Wyciszenie zdjete' : 'Uzytkownik wyciszony')
        router.refresh()
      } else {
        toast.error(result.error || 'Cos poszlo nie tak')
      }
    })
  }

  const handleBan = async (userId: string) => {
    startTransition(async () => {
      const result = await banMember(server.id, userId)
      if (result.success) {
        toast.success('Uzytkownik zbanowany')
        router.refresh()
      } else {
        toast.error(result.error || 'Nie udalo sie zbanowac uzytkownika')
      }
    })
  }

  const handleUpdateRole = async (userId: string, role: string) => {
    startTransition(async () => {
      const result = await updateMemberRole(server.id, userId, role)
      if (result.success) {
        toast.success('Rola zaktualizowana')
        router.refresh()
      } else {
        toast.error(result.error || 'Nie udalo sie zmienic roli')
      }
    })
  }

  const handleDeleteServer = async () => {
    startTransition(async () => {
      const result = await deleteServer(server.id)
      if (result.success) {
        toast.success('Serwer usuniety')
        router.push('/dashboard/servers')
      } else {
        toast.error(result.error || 'Nie udalo sie usunac serwera')
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

  // Users not in server for adding
  const availableUsers = members.filter((m) => !m.isBanned)

  return (
    <div className="flex h-[calc(100svh-8rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/servers">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarImage src={server.image ?? undefined} alt={server.name} />
            <AvatarFallback className="bg-secondary">
              {server.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold">{server.name}</h1>
            <p className="text-sm text-muted-foreground">
              {members.filter((m) => !m.isBanned).length} czlonkow
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.refresh()}>
            <RefreshCw className="h-4 w-4" />
          </Button>

          {/* Members Sheet */}
          <Sheet open={membersOpen} onOpenChange={setMembersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Users className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center justify-between">
                  Czlonkowie
                  {isModerator && (
                    <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <UserPlus className="mr-2 h-4 w-4" />
                          Dodaj
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Dodaj czlonka</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Wybierz uzytkownika..." />
                            </SelectTrigger>
                            <SelectContent>
                              {/* In real app, would search all users */}
                              <SelectItem value="placeholder">
                                Wprowadz ID uzytkownika
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Lub wpisz ID uzytkownika..."
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                          />
                          <Button
                            onClick={handleAddMember}
                            disabled={!selectedUserId || isPending}
                            className="w-full"
                          >
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Dodaj
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </SheetTitle>
              </SheetHeader>
              <ScrollArea className="mt-4 h-[calc(100vh-10rem)]">
                <div className="space-y-2">
                  {members
                    .filter((m) => !m.isBanned)
                    .map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between rounded-lg p-2 hover:bg-secondary"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.image ?? undefined} alt={member.name} />
                            <AvatarFallback className="text-sm">
                              {member.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-1">
                              {getRoleIcon(member.role)}
                              <span className="text-sm font-medium">{member.name}</span>
                              {member.isMuted && (
                                <VolumeX className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </div>

                        {isModerator && member.id !== currentUserId && member.role !== 'owner' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {isOwner && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateRole(
                                        member.id,
                                        member.role === 'moderator' ? 'member' : 'moderator'
                                      )
                                    }
                                  >
                                    <Shield className="mr-2 h-4 w-4" />
                                    {member.role === 'moderator'
                                      ? 'Odbierz moderatora'
                                      : 'Nadaj moderatora'}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleToggleMute(member.id, member.isMuted)}
                              >
                                {member.isMuted ? (
                                  <>
                                    <Volume2 className="mr-2 h-4 w-4" />
                                    Zdejmij wyciszenie
                                  </>
                                ) : (
                                  <>
                                    <VolumeX className="mr-2 h-4 w-4" />
                                    Wycisz
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleRemoveMember(member.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Wyrzuc
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleBan(member.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                Zbanuj
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>

          {/* Delete Server (Owner only) */}
          {isOwner && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setDeleteDialogOpen(true)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>

              <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Usunac serwer?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Ta akcja jest nieodwracalna. Wszystkie wiadomosci i dane serwera zostana
                      trwale usuniete.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Anuluj</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteServer}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Usun
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 py-4">
        <div className="space-y-4">
          {messages.length > 0 ? (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'group flex items-start gap-3',
                  msg.userId === currentUserId && 'flex-row-reverse'
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={msg.user.image ?? undefined} alt={msg.user.name} />
                  <AvatarFallback className="text-xs">
                    {msg.user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    'max-w-[70%] rounded-lg px-4 py-2',
                    msg.userId === currentUserId
                      ? 'bg-foreground text-background'
                      : 'bg-secondary'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium opacity-70">{msg.user.name}</span>
                    <span className="text-xs opacity-50">
                      {new Date(msg.createdAt).toLocaleTimeString('pl-PL', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap break-words">{msg.content}</p>
                  {msg.imageUrl && (
                    <img
                      src={msg.imageUrl}
                      alt="Zalacznik"
                      className="mt-2 max-h-60 rounded"
                    />
                  )}
                </div>
                {(isModerator || msg.userId === currentUserId) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={() => handleDeleteMessage(msg.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))
          ) : (
            <div className="flex h-full items-center justify-center py-20 text-muted-foreground">
              Brak wiadomosci. Napisz pierwsza!
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="border-t border-border pt-4">
        {isMuted ? (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-secondary p-4 text-muted-foreground">
            <VolumeX className="h-5 w-5" />
            <span>Jestes wyciszony na tym serwerze</span>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Napisz wiadomosc..."
              disabled={isPending}
              className="flex-1"
            />
            <Button type="submit" disabled={!newMessage.trim() || isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}
