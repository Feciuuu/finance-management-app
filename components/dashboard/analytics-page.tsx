'use client'

import { Card } from '@/components/ui/card'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts'

interface MonthlyData {
  month: string
  income: number
  expenses: number
  balance: number
}

interface CategoryData {
  name: string
  value: number
  color: string
}

interface Stats {
  totalIncome: number
  totalExpenses: number
  totalBalance: number
  avgMonthlyIncome: number
  avgMonthlyExpenses: number
  transactionCount: number
}

interface AnalyticsPageProps {
  monthlyData: MonthlyData[]
  categoryData: CategoryData[]
  stats: Stats
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
  }).format(value)
}

const formatCurrencyShort = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M PLN`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k PLN`
  }
  return formatCurrency(value)
}

export function AnalyticsPage({ monthlyData, categoryData, stats }: AnalyticsPageProps) {
  const savingsRate = stats.totalIncome > 0 
    ? ((stats.totalIncome - stats.totalExpenses) / stats.totalIncome * 100).toFixed(1)
    : '0'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analityka</h1>
        <p className="text-muted-foreground">
          Szczegolowy przeglad Twoich finansow
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Laczne przychody</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalIncome)}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
              <ArrowUpRight className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Srednia: {formatCurrency(stats.avgMonthlyIncome)}/mies.
          </p>
        </Card>

        <Card className="border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Laczne wydatki</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalExpenses)}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
              <ArrowDownRight className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Srednia: {formatCurrency(stats.avgMonthlyExpenses)}/mies.
          </p>
        </Card>

        <Card className="border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Bilans</p>
              <p className={cn(
                'text-2xl font-bold',
                stats.totalBalance >= 0 ? 'text-foreground' : 'text-destructive'
              )}>
                {formatCurrency(stats.totalBalance)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
              <Wallet className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Stopa oszczednosci: {savingsRate}%
          </p>
        </Card>

        <Card className="border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Transakcje</p>
              <p className="text-2xl font-bold">{stats.transactionCount}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
              <BarChart3 className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Wszystkie operacje
          </p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Balance Chart */}
        <Card className="border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">Przychody vs Wydatki (12 mies.)</h2>
          </div>
          <div className="h-[300px]">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickFormatter={(value) => formatCurrencyShort(value)}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [formatCurrency(value), '']}
                  />
                  <Bar dataKey="income" name="Przychody" fill="hsl(var(--foreground))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Wydatki" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Brak danych do wyswietlenia
              </div>
            )}
          </div>
        </Card>

        {/* Category Breakdown */}
        <Card className="border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">Wydatki wg kategorii</h2>
          </div>
          <div className="h-[300px]">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [formatCurrency(value), '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Brak wydatkow z kategoriami
              </div>
            )}
          </div>
        </Card>

        {/* Balance Trend */}
        <Card className="border-border bg-card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">Trend bilansu (12 mies.)</h2>
          </div>
          <div className="h-[250px]">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickFormatter={(value) => formatCurrencyShort(value)}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Bilans']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="balance" 
                    stroke="hsl(var(--foreground))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--foreground))', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Brak danych do wyswietlenia
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Category Details */}
      {categoryData.length > 0 && (
        <Card className="border-border bg-card p-6">
          <h2 className="mb-4 font-semibold">Szczegoly kategorii</h2>
          <div className="space-y-3">
            {categoryData
              .sort((a, b) => b.value - a.value)
              .map((cat, index) => {
                const maxValue = Math.max(...categoryData.map(c => c.value))
                const percentage = (cat.value / maxValue) * 100
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: cat.color }}
                        />
                        <span>{cat.name}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(cat.value)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
          </div>
        </Card>
      )}
    </div>
  )
}
