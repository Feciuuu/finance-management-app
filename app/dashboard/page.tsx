import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { transaction, category } from '@/lib/db/schema'
import { eq, desc, sql, and, gte } from 'drizzle-orm'
import { DashboardOverview } from '@/components/dashboard/overview'

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session!.user.id

  // Get current month range
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  // Get transactions for current month
  const transactions = await db
    .select()
    .from(transaction)
    .where(
      and(
        eq(transaction.userId, userId),
        gte(transaction.date, startOfMonth.toISOString().split('T')[0])
      )
    )
    .orderBy(desc(transaction.createdAt))
    .limit(10)

  // Get categories
  const categories = await db
    .select()
    .from(category)
    .where(eq(category.userId, userId))

  // Calculate totals
  const allTransactions = await db
    .select()
    .from(transaction)
    .where(eq(transaction.userId, userId))

  const totalIncome = allTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)

  const totalExpenses = allTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)

  const monthlyIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)

  const monthlyExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)

  // Get monthly data for chart (last 6 months)
  const monthlyData = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
    
    const monthTransactions = allTransactions.filter((t) => {
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
      month: date.toLocaleDateString('pl-PL', { month: 'short' }),
      income,
      expenses,
    })
  }

  // Get expenses by category for pie chart
  const expensesByCategory = categories.map((cat) => {
    const total = allTransactions
      .filter((t) => t.type === 'expense' && t.categoryId === cat.id)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)
    return {
      name: cat.name,
      value: total,
      color: cat.color,
    }
  }).filter((c) => c.value > 0)

  return (
    <DashboardOverview
      stats={{
        totalBalance: totalIncome - totalExpenses,
        monthlyIncome,
        monthlyExpenses,
        monthlyBalance: monthlyIncome - monthlyExpenses,
      }}
      monthlyData={monthlyData}
      expensesByCategory={expensesByCategory}
      recentTransactions={transactions.map((t) => ({
        ...t,
        category: categories.find((c) => c.id === t.categoryId),
      }))}
    />
  )
}
