import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { transaction, category } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { AnalyticsPage } from '@/components/dashboard/analytics-page'

export default async function AnalyticsRoute() {
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

  // Calculate analytics data
  const now = new Date()
  
  // Monthly data for last 12 months
  const monthlyData = []
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
    
    const monthTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date)
      return tDate >= date && tDate <= endDate
    })

    const income = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    const expenses = monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    monthlyData.push({
      month: date.toLocaleDateString('pl-PL', { month: 'short', year: '2-digit' }),
      income,
      expenses,
      balance: income - expenses,
    })
  }

  // Category breakdown
  const categoryData = categories.map((cat) => {
    const total = transactions
      .filter((t) => t.type === 'expense' && t.categoryId === cat.id)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)
    return {
      name: cat.name,
      value: total,
      color: cat.color,
    }
  }).filter((c) => c.value > 0)

  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)

  // Average monthly
  const monthsWithData = monthlyData.filter((m) => m.income > 0 || m.expenses > 0).length || 1
  const avgMonthlyIncome = totalIncome / monthsWithData
  const avgMonthlyExpenses = totalExpenses / monthsWithData

  return (
    <AnalyticsPage
      monthlyData={monthlyData}
      categoryData={categoryData}
      stats={{
        totalIncome,
        totalExpenses,
        totalBalance: totalIncome - totalExpenses,
        avgMonthlyIncome,
        avgMonthlyExpenses,
        transactionCount: transactions.length,
      }}
    />
  )
}
