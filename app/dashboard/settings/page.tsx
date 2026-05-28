import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { SettingsPage } from '@/components/dashboard/settings-page'

export default async function SettingsRoute() {
  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session!.user.id

  const [userData] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))

  return <SettingsPage user={userData} />
}
