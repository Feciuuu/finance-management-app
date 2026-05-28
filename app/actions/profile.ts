'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { put } from '@vercel/blob'

export async function updateProfile(data: {
  name: string
  username: string | null
  bio: string | null
  occupation: string | null
}) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return { success: false, error: 'Nieautoryzowany' }
    }

    // Check if username is taken by another user
    if (data.username) {
      const existingUser = await db
        .select()
        .from(user)
        .where(eq(user.username, data.username))

      if (existingUser.length > 0 && existingUser[0].id !== session.user.id) {
        return { success: false, error: 'Ta nazwa uzytkownika jest juz zajeta' }
      }
    }

    await db
      .update(user)
      .set({
        name: data.name,
        username: data.username,
        bio: data.bio,
        occupation: data.occupation,
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id))

    revalidatePath('/dashboard/profile')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { success: false, error: 'Nie udalo sie zaktualizowac profilu' }
  }
}

export async function uploadAvatar(formData: FormData) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return { success: false, error: 'Nieautoryzowany' }
    }

    const file = formData.get('file') as File
    if (!file) {
      return { success: false, error: 'Brak pliku' }
    }

    // Upload to Vercel Blob
    const blob = await put(`avatars/${session.user.id}-${Date.now()}`, file, {
      access: 'public',
      addRandomSuffix: true,
    })

    // Update user avatar in database
    await db
      .update(user)
      .set({
        image: blob.url,
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id))

    revalidatePath('/dashboard/profile')
    revalidatePath('/dashboard')
    return { success: true, url: blob.url }
  } catch (error) {
    console.error('Error uploading avatar:', error)
    return { success: false, error: 'Nie udalo sie przeslac avatara' }
  }
}

export async function updatePrivacy(isPublic: boolean) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return { success: false, error: 'Nieautoryzowany' }
    }

    await db
      .update(user)
      .set({
        isPublic,
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id))

    revalidatePath('/dashboard/settings')
    revalidatePath('/dashboard/profile')
    return { success: true }
  } catch (error) {
    console.error('Error updating privacy:', error)
    return { success: false, error: 'Nie udalo sie zaktualizowac ustawien prywatnosci' }
  }
}
