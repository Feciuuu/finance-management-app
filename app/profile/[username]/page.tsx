import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { PublicProfileView } from '@/components/public-profile'

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params

  const users = await db
    .select({
      id: user.id,
      name: user.name,
      username: user.username,
      image: user.image,
      bio: user.bio,
      occupation: user.occupation,
      isPublic: user.isPublic,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(eq(user.username, username))
    .limit(1)

  if (users.length === 0) {
    notFound()
  }

  const profileUser = users[0]

  if (!profileUser.isPublic) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-border bg-card">
            <span className="text-3xl">🔒</span>
          </div>
          <h1 className="mb-2 text-xl font-bold">Profil prywatny</h1>
          <p className="text-muted-foreground">Ten uzytkownik ma profil prywatny</p>
        </div>
      </div>
    )
  }

  return <PublicProfileView user={profileUser} />
}
