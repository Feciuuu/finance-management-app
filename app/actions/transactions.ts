'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { transaction, category } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function addTransaction(data: {
  title: string
  amount: number
  type: 'income' | 'expense'
  categoryId: number | null
  date: string
  description: string | null
}) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return { success: false, error: 'Nieautoryzowany' }
    }

    await db.insert(transaction).values({
      title: data.title,
      amount: data.amount.toString(),
      type: data.type,
      categoryId: data.categoryId,
      date: data.date,
      description: data.description,
      userId: session.user.id,
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/transactions')
    return { success: true }
  } catch (error) {
    console.error('Error adding transaction:', error)
    return { success: false, error: 'Nie udalo sie dodac transakcji' }
  }
}

export async function deleteTransaction(id: number) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return { success: false, error: 'Nieautoryzowany' }
    }

    await db
      .delete(transaction)
      .where(and(eq(transaction.id, id), eq(transaction.userId, session.user.id)))

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/transactions')
    return { success: true }
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return { success: false, error: 'Nie udalo sie usunac transakcji' }
  }
}

export async function addCategory(data: { name: string; color: string }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return { success: false, error: 'Nieautoryzowany' }
    }

    await db.insert(category).values({
      name: data.name,
      color: data.color,
      userId: session.user.id,
    })

    revalidatePath('/dashboard/transactions')
    return { success: true }
  } catch (error) {
    console.error('Error adding category:', error)
    return { success: false, error: 'Nie udalo sie dodac kategorii' }
  }
}

export async function deleteCategory(id: number) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return { success: false, error: 'Nieautoryzowany' }
    }

    await db
      .delete(category)
      .where(and(eq(category.id, id), eq(category.userId, session.user.id)))

    revalidatePath('/dashboard/transactions')
    return { success: true }
  } catch (error) {
    console.error('Error deleting category:', error)
    return { success: false, error: 'Nie udalo sie usunac kategorii' }
  }
}
