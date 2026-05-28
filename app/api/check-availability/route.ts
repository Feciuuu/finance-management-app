import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const email = searchParams.get('email')
  const username = searchParams.get('username')

  if (email) {
    const existingUser = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1)
    return NextResponse.json({ available: existingUser.length === 0 })
  }

  if (username) {
    const existingUser = await db.select({ id: user.id }).from(user).where(eq(user.username, username)).limit(1)
    return NextResponse.json({ available: existingUser.length === 0 })
  }

  return NextResponse.json({ available: true })
}
