import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { server, serverMember, message, user } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { ServerChatPage } from '@/components/dashboard/server-chat-page'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ServerRoute({ params }: PageProps) {
  const { id } = await params
  const serverId = parseInt(id)
  
  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session!.user.id

  // Get server
  const [serverData] = await db
    .select()
    .from(server)
    .where(eq(server.id, serverId))

  if (!serverData) {
    redirect('/dashboard/servers')
  }

  // Check membership
  const [membership] = await db
    .select()
    .from(serverMember)
    .where(and(eq(serverMember.serverId, serverId), eq(serverMember.userId, userId)))

  if (!membership || membership.isBanned) {
    redirect('/dashboard/servers')
  }

  // Get all members
  const members = await db
    .select({
      member: serverMember,
      user: user,
    })
    .from(serverMember)
    .innerJoin(user, eq(serverMember.userId, user.id))
    .where(eq(serverMember.serverId, serverId))

  // Get messages
  const messages = await db
    .select({
      message: message,
      user: user,
    })
    .from(message)
    .innerJoin(user, eq(message.userId, user.id))
    .where(eq(message.serverId, serverId))
    .orderBy(desc(message.createdAt))
    .limit(100)

  return (
    <ServerChatPage
      server={serverData}
      members={members.map((m) => ({
        ...m.user,
        role: m.member.role,
        isMuted: m.member.isMuted,
        isBanned: m.member.isBanned,
      }))}
      messages={messages.reverse().map((m) => ({
        ...m.message,
        user: m.user,
      }))}
      currentUserId={userId}
      currentUserRole={membership.role}
      isMuted={membership.isMuted}
    />
  )
}
