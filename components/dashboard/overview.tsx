'use client'

import { Card } from '@/components/ui/card'
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { cn } from '@/lib/utils'

interface Category {
  id: number
  name: string
  color: string
}

interface Transaction {
  id: number
  title: string
  amount: string
  type: string
  date: string
  category?: Category | null
}

interface DashboardOverviewProps {
  stats: {
    totalBalance: number
    monthlyIncome: number
    monthlyExpenses: number
    monthlyBalance: number
  }
  monthlyData: Array<{
    month: string
    income: number
    expenses: number
  }>
  expensesByCategory: Array<{
    name: string
    value: number
    color: string
  }>
  recentTransactions: Transaction[]
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
  }).format(value)
}

export function DashboardOverview({
  stats,
  monthlyData,
  expensesByCategory,
  recentTransactions,
}: DashboardOverviewProps) {
  const statCards = [
    {
      title: 'Calkowity bilans',
      value: stats.totalBalance,
      icon: Wallet,
      trend: stats.totalBalance >= 0 ? 'up' : 'down',
    },
    {
      title: 'Przychody (miesiac)',
      value: stats.monthlyIncome,
      icon: TrendingUp,
      trend: 'up' as const,
    },
    {
      title: 'Wydatki (miesiac)',
      value: stats.monthlyExpenses,
      icon: TrendingDown,
      trend: 'down' as const,
    },
    {
      title: 'Bilans (miesiac)',
      value: stats.monthlyBalance,
      icon: DollarSign,
      trend: stats.monthlyBalance >= 0 ? 'up' : 'down',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-border bg-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className={cn(
                  'mt-2 text-2xl font-bold tracking-tight',
                  stat.trend === 'up' ? 'text-foreground' : 'text-foreground'
                )}>
                  {formatCurrency(stat.value)}
                </p>
              </div>
              <div className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg',
                stat.trend === 'up' ? 'bg-secondary' : 'bg-secondary'
              )}>
                <stat.icon className="h-5 w-5 text-foreground" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Area Chart - 2 columns */}
        <Card className="border-border bg-card p-5 lg:col-span-2">
          <h3 className="mb-4 text-lg font-semibold">Przychody vs Wydatki</h3>
          <div className="h-[300px]">
            {monthlyData.some(d => d.income > 0 || d.expenses > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0, 0%, 98%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(0, 0%, 98%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0, 0%, 50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(0, 0%, 50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 20%)" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(0, 0%, 50%)" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(0, 0%, 50%)" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(0, 0%, 12%)',
                      border: '1px solid hsl(0, 0%, 22%)',
                      borderRadius: '8px',
                      color: 'hsl(0, 0%, 98%)',
                    }}
                    formatter={(value: number) => [formatCurrency(value), '']}
                    labelStyle={{ color: 'hsl(0, 0%, 65%)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Przychody"
                    stroke="hsl(0, 0%, 98%)"
                    fillOpacity={1}
                    fill="url(#incomeGradient)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    name="Wydatki"
                    stroke="hsl(0, 0%, 50%)"
                    fillOpacity={1}
                    fill="url(#expenseGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Brak danych do wyswietlenia
              </div>
            )}
          </div>
        </Card>

        {/* Pie Chart */}
        <Card className="border-border bg-card p-5">
          <h3 className="mb-4 text-lg font-semibold">Wydatki wg kategorii</h3>
          <div className="h-[300px]">
            {expensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color || `hsl(0, 0%, ${70 - index * 15}%)`} 
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(0, 0%, 12%)',
                      border: '1px solid hsl(0, 0%, 22%)',
                      borderRadius: '8px',
                      color: 'hsl(0, 0%, 98%)',
                    }}
                    formatter={(value: number) => [formatCurrency(value), '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Brak wydatkow
              </div>
            )}
          </div>
          {/* Legend */}
          {expensesByCategory.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {expensesByCategory.map((cat, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: cat.color || `hsl(0, 0%, ${70 - index * 15}%)` }}
                  />
                  <span className="text-muted-foreground">{cat.name}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Ostatnie transakcje</h3>
          <a
            href="/dashboard/transactions"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Zobacz wszystkie
          </a>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-lg border border-border bg-background p-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg',
                      tx.type === 'income' ? 'bg-secondary' : 'bg-secondary'
                    )}
                  >
                    {tx.type === 'income' ? (
                      <ArrowUpRight className="h-5 w-5 text-foreground" />
                    ) : (
                      <ArrowDownRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{tx.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {tx.category?.name || 'Bez kategorii'} &middot;{' '}
                      {new Date(tx.date).toLocaleDateString('pl-PL')}
                    </p>
                  </div>
                </div>
                <p
                  className={cn(
                    'font-semibold',
                    tx.type === 'income' ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {tx.type === 'income' ? '+' : '-'}
                  {formatCurrency(parseFloat(tx.amount))}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center text-muted-foreground">
            Brak transakcji. Dodaj pierwsza transakcje!
          </div>
        )}
      </Card>
    </div>
  )
}
