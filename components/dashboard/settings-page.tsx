'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Globe, Lock, Bell, Shield, Trash2, Loader2, LogOut } from 'lucide-react'
import { updatePrivacy } from '@/app/actions/profile'
import { authClient } from '@/lib/auth-client'
import { toast } from 'sonner'

interface UserData {
  id: string
  name: string
  email: string
  isPublic: boolean
  isAdmin: boolean
}

interface SettingsPageProps {
  user: UserData
}

export function SettingsPage({ user }: SettingsPageProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isPublic, setIsPublic] = useState(user.isPublic)
  const [notifications, setNotifications] = useState(true)

  const handlePrivacyChange = async (value: boolean) => {
    setIsPublic(value)
    startTransition(async () => {
      const result = await updatePrivacy(value)
      if (result.success) {
        toast.success('Ustawienia prywatnosci zaktualizowane')
      } else {
        setIsPublic(!value)
        toast.error(result.error || 'Cos poszlo nie tak')
      }
    })
  }

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ustawienia</h1>
        <p className="text-muted-foreground">Zarzadzaj ustawieniami konta i preferencjami</p>
      </div>

      {/* Privacy Settings */}
      <Card className="border-border bg-card p-6">
        <div className="flex items-center gap-3">
          {isPublic ? (
            <Globe className="h-5 w-5 text-foreground" />
          ) : (
            <Lock className="h-5 w-5 text-muted-foreground" />
          )}
          <div>
            <h3 className="text-lg font-semibold">Prywatnosc profilu</h3>
            <p className="text-sm text-muted-foreground">
              Kontroluj kto moze widziec Twoj profil
            </p>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="public-profile" className="text-base">
                Profil publiczny
              </Label>
              <p className="text-sm text-muted-foreground">
                Inni uzytkownicy moga widziec Twoj profil, bio i zainteresowania
              </p>
            </div>
            <Switch
              id="public-profile"
              checked={isPublic}
              onCheckedChange={handlePrivacyChange}
              disabled={isPending}
            />
          </div>

          <div className="rounded-lg border border-border bg-secondary/30 p-4">
            <div className="flex items-center gap-2">
              {isPublic ? (
                <Globe className="h-4 w-4 text-foreground" />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm font-medium">
                {isPublic
                  ? 'Twoj profil jest widoczny dla wszystkich'
                  : 'Twoj profil jest ukryty'}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {isPublic
                ? 'Kazdy zalogowany uzytkownik moze zobaczyc Twoje informacje profilowe.'
                : 'Tylko Ty mozesz widziec swoj profil. Inni widza jedynie Twoje imie.'}
            </p>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="border-border bg-card p-6">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">Powiadomienia</h3>
            <p className="text-sm text-muted-foreground">Zarzadzaj powiadomieniami</p>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications" className="text-base">
                Powiadomienia email
              </Label>
              <p className="text-sm text-muted-foreground">
                Otrzymuj powiadomienia o waznych wydarzeniach na email
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>
        </div>
      </Card>

      {/* Security */}
      <Card className="border-border bg-card p-6">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">Bezpieczenstwo</h3>
            <p className="text-sm text-muted-foreground">Opcje bezpieczenstwa konta</p>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-medium">Wyloguj sie ze wszystkich urzadzen</p>
              <p className="text-sm text-muted-foreground">
                Wyloguje Cie ze wszystkich aktywnych sesji
              </p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Wyloguj
            </Button>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50 bg-card p-6">
        <div className="flex items-center gap-3">
          <Trash2 className="h-5 w-5 text-destructive" />
          <div>
            <h3 className="text-lg font-semibold text-destructive">Strefa niebezpieczna</h3>
            <p className="text-sm text-muted-foreground">Nieodwracalne akcje na koncie</p>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="font-medium">Usun konto</p>
            <p className="text-sm text-muted-foreground">
              Trwale usun swoje konto i wszystkie dane
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Usun konto</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Czy na pewno chcesz usunac konto?</AlertDialogTitle>
                <AlertDialogDescription>
                  Ta akcja jest nieodwracalna. Wszystkie Twoje dane, transakcje, wiadomosci i
                  ustawienia zostana trwale usuniete.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Anuluj</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Usun konto
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Card>
    </div>
  )
}
