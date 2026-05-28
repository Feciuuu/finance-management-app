import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { ProfilePage } from '@/components/dashboard/profile-page'

export default async function ProfileRoute() {
  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session!.user.id

  const [userData] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))

  return <ProfilePage user={userData} />
}
