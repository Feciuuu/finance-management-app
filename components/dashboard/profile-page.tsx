'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Camera, Loader2, User, Mail, Briefcase, Globe, Lock, Shield } from 'lucide-react'
import { updateProfile, uploadAvatar } from '@/app/actions/profile'
import { toast } from 'sonner'

interface UserData {
  id: string
  name: string
  email: string
  username: string | null
  image: string | null
  bio: string | null
  occupation: string | null
  isPublic: boolean
  isAdmin: boolean
  createdAt: Date
}

interface ProfilePageProps {
  user: UserData
}

export function ProfilePage({ user }: ProfilePageProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(user.name)
  const [username, setUsername] = useState(user.username || '')
  const [bio, setBio] = useState(user.bio || '')
  const [occupation, setOccupation] = useState(user.occupation || '')
  const [uploading, setUploading] = useState(false)

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.includes('gif')) {
      toast.error('Dozwolone tylko obrazy (PNG, JPG, GIF)')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Maksymalny rozmiar pliku to 5MB')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const result = await uploadAvatar(formData)

      if (result.success) {
        toast.success('Avatar zaktualizowany')
        router.refresh()
      } else {
        toast.error(result.error || 'Cos poszlo nie tak')
      }
    } catch {
      toast.error('Blad podczas przesylania')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    startTransition(async () => {
      const result = await updateProfile({
        name,
        username: username || null,
        bio: bio || null,
        occupation: occupation || null,
      })

      if (result.success) {
        toast.success('Profil zaktualizowany')
        router.refresh()
      } else {
        toast.error(result.error || 'Cos poszlo nie tak')
      }
    })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profil</h1>
        <p className="text-muted-foreground">Zarzadzaj swoim profilem i danymi osobowymi</p>
      </div>

      {/* Avatar Card */}
      <Card className="border-border bg-card p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.image ?? undefined} alt={user.name} />
              <AvatarFallback className="bg-secondary text-2xl">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={handleAvatarClick}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.gif"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
              {user.isAdmin && (
                <Badge variant="secondary" className="gap-1">
                  <Shield className="h-3 w-3" />
                  Admin
                </Badge>
              )}
              <Badge variant="outline" className="gap-1">
                {user.isPublic ? (
                  <>
                    <Globe className="h-3 w-3" />
                    Publiczny
                  </>
                ) : (
                  <>
                    <Lock className="h-3 w-3" />
                    Prywatny
                  </>
                )}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Form */}
      <Card className="border-border bg-card p-6">
        <h3 className="mb-6 text-lg font-semibold">Dane osobowe</h3>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Imie i nazwisko
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jan Kowalski"
                className="bg-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <span className="text-muted-foreground">@</span>
                Nazwa uzytkownika
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="jankowalski"
                className="bg-input"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email
            </Label>
            <Input
              id="email"
              value={user.email}
              disabled
              className="bg-secondary text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">Email nie moze byc zmieniony</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="occupation" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              Zawod / Stanowisko
            </Label>
            <Input
              id="occupation"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              placeholder="np. Programista, Designer"
              className="bg-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">O mnie</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Napisz cos o sobie..."
              rows={4}
              className="bg-input resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {bio.length}/500 znakow
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Zapisz zmiany
          </Button>
        </div>
      </Card>

      {/* Account Info */}
      <Card className="border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold">Informacje o koncie</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">ID konta</span>
            <span className="font-mono text-xs">{user.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Data rejestracji</span>
            <span>
              {new Date(user.createdAt).toLocaleDateString('pl-PL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status konta</span>
            <Badge variant="outline">Aktywne</Badge>
          </div>
        </div>
      </Card>
    </div>
  )
}
