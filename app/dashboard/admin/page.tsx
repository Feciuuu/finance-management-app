import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { AdminPage } from '@/components/dashboard/admin-page'

export default async function AdminRoute() {
  const session = await auth.api.getSession({ headers: await headers() })
  
  // Check if user is admin
  if (!session?.user?.isAdmin) {
    redirect('/dashboard')
  }

  const users = await db
    .select()
    .from(user)
    .orderBy(desc(user.createdAt))

  return <AdminPage users={users} currentUserId={session.user.id} />
}
