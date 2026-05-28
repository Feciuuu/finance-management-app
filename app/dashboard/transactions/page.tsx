import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { transaction, category } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { TransactionsPage } from '@/components/dashboard/transactions-page'

export default async function TransactionsRoute() {
  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session!.user.id

  const transactions = await db
    .select()
    .from(transaction)
    .where(eq(transaction.userId, userId))
    .orderBy(desc(transaction.date))

  const categories = await db
    .select()
    .from(category)
    .where(eq(category.userId, userId))

  return (
    <TransactionsPage
      initialTransactions={transactions.map((t) => ({
        ...t,
        category: categories.find((c) => c.id === t.categoryId),
      }))}
      categories={categories}
    />
  )
}
