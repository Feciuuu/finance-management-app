'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user, transaction, category, serverMember, message } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

async function isAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.isAdmin) {
    return { authorized: false, session: null }
  }
  return { authorized: true, session }
}

export async function toggleAdmin(userId: string, isAdminValue: boolean) {
  try {
    const { authorized } = await isAdmin()
    if (!authorized) {
      return { success: false, error: 'Brak uprawnien' }
    }

    await db
      .update(user)
      .set({
        isAdmin: isAdminValue,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId))

    revalidatePath('/dashboard/admin')
    return { success: true }
  } catch (error) {
    console.error('Error toggling admin:', error)
    return { success: false, error: 'Nie udalo sie zmienic uprawnien' }
  }
}

export async function deleteUser(userId: string) {
  try {
    const { authorized, session } = await isAdmin()
    if (!authorized) {
      return { success: false, error: 'Brak uprawnien' }
    }

    // Prevent deleting yourself
    if (session?.user.id === userId) {
      return { success: false, error: 'Nie mozesz usunac swojego konta z panelu admina' }
    }

    // Delete user's data (cascade should handle most of this)
    await db.delete(transaction).where(eq(transaction.userId, userId))
    await db.delete(category).where(eq(category.userId, userId))
    await db.delete(message).where(eq(message.userId, userId))
    await db.delete(serverMember).where(eq(serverMember.userId, userId))
    
    // Delete user (this will cascade delete sessions and accounts)
    await db.delete(user).where(eq(user.id, userId))

    revalidatePath('/dashboard/admin')
    return { success: true }
  } catch (error) {
    console.error('Error deleting user:', error)
    return { success: false, error: 'Nie udalo sie usunac uzytkownika' }
  }
}

export async function getAllUsers() {
  try {
    const { authorized } = await isAdmin()
    if (!authorized) {
      return { success: false, error: 'Brak uprawnien', users: [] }
    }

    const users = await db.select().from(user)
    return { success: true, users }
  } catch (error) {
    console.error('Error fetching users:', error)
    return { success: false, error: 'Nie udalo sie pobrac uzytkownikow', users: [] }
  }
}
