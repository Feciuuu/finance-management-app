'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { server, serverMember, message } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

async function getSession() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return null
  }
  return session
}

async function getMembership(serverId: number, userId: string) {
  const [membership] = await db
    .select()
    .from(serverMember)
    .where(and(eq(serverMember.serverId, serverId), eq(serverMember.userId, userId)))
  return membership
}

export async function createServer(data: { name: string; description: string | null }) {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Nieautoryzowany' }
    }

    // Create server
    const [newServer] = await db
      .insert(server)
      .values({
        name: data.name,
        description: data.description,
        ownerId: session.user.id,
      })
      .returning()

    // Add creator as owner
    await db.insert(serverMember).values({
      serverId: newServer.id,
      userId: session.user.id,
      role: 'owner',
    })

    revalidatePath('/dashboard/servers')
    return { success: true, serverId: newServer.id }
  } catch (error) {
    console.error('Error creating server:', error)
    return { success: false, error: 'Nie udalo sie utworzyc serwera' }
  }
}

export async function deleteServer(serverId: number) {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Nieautoryzowany' }
    }

    // Check if user is owner
    const [serverData] = await db
      .select()
      .from(server)
      .where(eq(server.id, serverId))

    if (!serverData || serverData.ownerId !== session.user.id) {
      return { success: false, error: 'Tylko wlasciciel moze usunac serwer' }
    }

    // Delete server (cascade will delete members and messages)
    await db.delete(message).where(eq(message.serverId, serverId))
    await db.delete(serverMember).where(eq(serverMember.serverId, serverId))
    await db.delete(server).where(eq(server.id, serverId))

    revalidatePath('/dashboard/servers')
    return { success: true }
  } catch (error) {
    console.error('Error deleting server:', error)
    return { success: false, error: 'Nie udalo sie usunac serwera' }
  }
}

export async function sendMessage(serverId: number, content: string) {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Nieautoryzowany' }
    }

    const membership = await getMembership(serverId, session.user.id)
    if (!membership || membership.isBanned || membership.isMuted) {
      return { success: false, error: 'Nie masz uprawnien do wysylania wiadomosci' }
    }

    await db.insert(message).values({
      content,
      serverId,
      userId: session.user.id,
    })

    revalidatePath(`/dashboard/servers/${serverId}`)
    return { success: true }
  } catch (error) {
    console.error('Error sending message:', error)
    return { success: false, error: 'Nie udalo sie wyslac wiadomosci' }
  }
}

export async function deleteMessage(messageId: number) {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Nieautoryzowany' }
    }

    // Get message
    const [msg] = await db
      .select()
      .from(message)
      .where(eq(message.id, messageId))

    if (!msg) {
      return { success: false, error: 'Wiadomosc nie istnieje' }
    }

    // Check if user is author or moderator
    const membership = await getMembership(msg.serverId, session.user.id)
    const isAuthor = msg.userId === session.user.id
    const isModerator = membership?.role === 'owner' || membership?.role === 'moderator'

    if (!isAuthor && !isModerator) {
      return { success: false, error: 'Nie masz uprawnien do usuwania tej wiadomosci' }
    }

    await db.delete(message).where(eq(message.id, messageId))

    revalidatePath(`/dashboard/servers/${msg.serverId}`)
    return { success: true }
  } catch (error) {
    console.error('Error deleting message:', error)
    return { success: false, error: 'Nie udalo sie usunac wiadomosci' }
  }
}

export async function addMember(serverId: number, userId: string) {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Nieautoryzowany' }
    }

    const membership = await getMembership(serverId, session.user.id)
    if (!membership || (membership.role !== 'owner' && membership.role !== 'moderator')) {
      return { success: false, error: 'Nie masz uprawnien' }
    }

    // Check if already a member
    const existing = await getMembership(serverId, userId)
    if (existing) {
      return { success: false, error: 'Uzytkownik jest juz czlonkiem' }
    }

    await db.insert(serverMember).values({
      serverId,
      userId,
      role: 'member',
    })

    revalidatePath(`/dashboard/servers/${serverId}`)
    return { success: true }
  } catch (error) {
    console.error('Error adding member:', error)
    return { success: false, error: 'Nie udalo sie dodac czlonka' }
  }
}

export async function removeMember(serverId: number, userId: string) {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Nieautoryzowany' }
    }

    const membership = await getMembership(serverId, session.user.id)
    if (!membership || (membership.role !== 'owner' && membership.role !== 'moderator')) {
      return { success: false, error: 'Nie masz uprawnien' }
    }

    // Can't remove owner
    const targetMembership = await getMembership(serverId, userId)
    if (targetMembership?.role === 'owner') {
      return { success: false, error: 'Nie mozna usunac wlasciciela' }
    }

    await db
      .delete(serverMember)
      .where(and(eq(serverMember.serverId, serverId), eq(serverMember.userId, userId)))

    revalidatePath(`/dashboard/servers/${serverId}`)
    return { success: true }
  } catch (error) {
    console.error('Error removing member:', error)
    return { success: false, error: 'Nie udalo sie usunac czlonka' }
  }
}

export async function updateMemberRole(serverId: number, userId: string, role: string) {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Nieautoryzowany' }
    }

    const membership = await getMembership(serverId, session.user.id)
    if (!membership || membership.role !== 'owner') {
      return { success: false, error: 'Tylko wlasciciel moze zmieniac role' }
    }

    await db
      .update(serverMember)
      .set({ role })
      .where(and(eq(serverMember.serverId, serverId), eq(serverMember.userId, userId)))

    revalidatePath(`/dashboard/servers/${serverId}`)
    return { success: true }
  } catch (error) {
    console.error('Error updating role:', error)
    return { success: false, error: 'Nie udalo sie zmienic roli' }
  }
}

export async function toggleMute(serverId: number, userId: string, isMuted: boolean) {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Nieautoryzowany' }
    }

    const membership = await getMembership(serverId, session.user.id)
    if (!membership || (membership.role !== 'owner' && membership.role !== 'moderator')) {
      return { success: false, error: 'Nie masz uprawnien' }
    }

    await db
      .update(serverMember)
      .set({ isMuted })
      .where(and(eq(serverMember.serverId, serverId), eq(serverMember.userId, userId)))

    revalidatePath(`/dashboard/servers/${serverId}`)
    return { success: true }
  } catch (error) {
    console.error('Error toggling mute:', error)
    return { success: false, error: 'Nie udalo sie wyciszyc uzytkownika' }
  }
}

export async function banMember(serverId: number, userId: string) {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Nieautoryzowany' }
    }

    const membership = await getMembership(serverId, session.user.id)
    if (!membership || (membership.role !== 'owner' && membership.role !== 'moderator')) {
      return { success: false, error: 'Nie masz uprawnien' }
    }

    // Can't ban owner
    const targetMembership = await getMembership(serverId, userId)
    if (targetMembership?.role === 'owner') {
      return { success: false, error: 'Nie mozna zbanowac wlasciciela' }
    }

    await db
      .update(serverMember)
      .set({ isBanned: true })
      .where(and(eq(serverMember.serverId, serverId), eq(serverMember.userId, userId)))

    revalidatePath(`/dashboard/servers/${serverId}`)
    return { success: true }
  } catch (error) {
    console.error('Error banning member:', error)
    return { success: false, error: 'Nie udalo sie zbanowac uzytkownika' }
  }
}
