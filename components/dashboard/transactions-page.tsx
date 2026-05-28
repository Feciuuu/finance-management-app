'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { addTransaction, deleteTransaction, addCategory } from '@/app/actions/transactions'
import { toast } from 'sonner'

interface Category {
  id: number
  name: string
  color: string
  userId: string
  createdAt: Date
}

interface Transaction {
  id: number
  title: string
  amount: string
  type: string
  date: string
  description: string | null
  categoryId: number | null
  userId: string
  createdAt: Date
  category?: Category | null
}

interface TransactionsPageProps {
  initialTransactions: Transaction[]
  categories: Category[]
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
  }).format(value)
}

export function TransactionsPage({ initialTransactions, categories }: TransactionsPageProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [transactions, setTransactions] = useState(initialTransactions)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [categoryId, setCategoryId] = useState<string>('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')

  // Category form
  const [categoryName, setCategoryName] = useState('')
  const [categoryColor, setCategoryColor] = useState('#ffffff')

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.title.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'all' || tx.type === typeFilter
    return matchesSearch && matchesType
  })

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const result = await addTransaction({
        title,
        amount: parseFloat(amount),
        type,
        categoryId: categoryId ? parseInt(categoryId) : null,
        date,
        description: description || null,
      })

      if (result.success) {
        toast.success('Transakcja dodana')
        setIsAddOpen(false)
        setTitle('')
        setAmount('')
        setType('expense')
        setCategoryId('')
        setDate(new Date().toISOString().split('T')[0])
        setDescription('')
        router.refresh()
      } else {
        toast.error(result.error || 'Cos poszlo nie tak')
      }
    })
  }

  const handleDeleteTransaction = async (id: number) => {
    startTransition(async () => {
      const result = await deleteTransaction(id)
      if (result.success) {
        setTransactions((prev) => prev.filter((tx) => tx.id !== id))
        toast.success('Transakcja usunieta')
      } else {
        toast.error(result.error || 'Cos poszlo nie tak')
      }
    })
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const result = await addCategory({
        name: categoryName,
        color: categoryColor,
      })

      if (result.success) {
        toast.success('Kategoria dodana')
        setIsCategoryOpen(false)
        setCategoryName('')
        setCategoryColor('#ffffff')
        router.refresh()
      } else {
        toast.error(result.error || 'Cos poszlo nie tak')
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transakcje</h1>
          <p className="text-muted-foreground">
            Zarzadzaj swoimi przychodami i wydatkami
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Kategoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dodaj kategorie</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryName">Nazwa</Label>
                  <Input
                    id="categoryName"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="np. Jedzenie"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryColor">Kolor</Label>
                  <div className="flex gap-2">
                    <Input
                      id="categoryColor"
                      type="color"
                      value={categoryColor}
                      onChange={(e) => setCategoryColor(e.target.value)}
                      className="h-10 w-14 cursor-pointer p-1"
                    />
                    <Input
                      value={categoryColor}
                      onChange={(e) => setCategoryColor(e.target.value)}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Dodaj
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Transakcja
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dodaj transakcje</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Tytul</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="np. Zakupy w sklepie"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Kwota (PLN)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Typ</Label>
                    <Select value={type} onValueChange={(v) => setType(v as 'income' | 'expense')}>
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Przychod</SelectItem>
                        <SelectItem value="expense">Wydatek</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Data</Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Kategoria</Label>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Wybierz..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            <div className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: cat.color }}
                              />
                              {cat.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Opis (opcjonalnie)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Dodatkowe informacje..."
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Dodaj transakcje
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-border bg-card p-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Szukaj transakcji..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={typeFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('all')}
            >
              Wszystkie
            </Button>
            <Button
              variant={typeFilter === 'income' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('income')}
            >
              Przychody
            </Button>
            <Button
              variant={typeFilter === 'expense' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('expense')}
            >
              Wydatki
            </Button>
          </div>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className="border-border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Transakcja</TableHead>
                <TableHead>Kategoria</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Kwota</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <TableRow key={tx.id} className="border-border">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-lg',
                            tx.type === 'income' ? 'bg-secondary' : 'bg-secondary'
                          )}
                        >
                          {tx.type === 'income' ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{tx.title}</p>
                          {tx.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {tx.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {tx.category ? (
                        <Badge
                          variant="secondary"
                          className="gap-1.5"
                          style={{ backgroundColor: tx.category.color + '20' }}
                        >
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: tx.category.color }}
                          />
                          {tx.category.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(tx.date).toLocaleDateString('pl-PL')}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right font-semibold',
                        tx.type === 'income' ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatCurrency(parseFloat(tx.amount))}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTransaction(tx.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        <span className="sr-only">Usun</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    {search || typeFilter !== 'all'
                      ? 'Brak transakcji spelniajacych kryteria'
                      : 'Brak transakcji. Dodaj pierwsza!'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
