import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const username = searchParams.get('username')

  if (!username) {
    return NextResponse.json({ email: null })
  }

  const existingUser = await db.select({ email: user.email }).from(user).where(eq(user.username, username)).limit(1)
  
  if (existingUser.length > 0) {
    return NextResponse.json({ email: existingUser[0].email })
  }

  return NextResponse.json({ email: null })
}
