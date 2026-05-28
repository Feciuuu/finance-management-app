import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { server, serverMember, user } from '@/lib/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { ServersPage } from '@/components/dashboard/servers-page'

export default async function ServersRoute() {
  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session!.user.id

  // Get servers where user is a member
  const userMemberships = await db
    .select({
      server: server,
      membership: serverMember,
    })
    .from(serverMember)
    .innerJoin(server, eq(serverMember.serverId, server.id))
    .where(and(eq(serverMember.userId, userId), eq(serverMember.isBanned, false)))
    .orderBy(desc(serverMember.joinedAt))

  // Get all users for adding members
  const allUsers = await db.select().from(user)

  const servers = userMemberships.map((m) => ({
    ...m.server,
    role: m.membership.role,
    isMuted: m.membership.isMuted,
  }))

  return <ServersPage servers={servers} allUsers={allUsers} currentUserId={userId} />
}
