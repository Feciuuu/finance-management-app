import { pgTable, text, timestamp, boolean, serial, decimal, date, integer } from 'drizzle-orm/pg-core'

// --- Better Auth required tables -------------------------------------------
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  username: text('username').unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  bio: text('bio'),
  occupation: text('occupation'),
  isPublic: boolean('isPublic').notNull().default(true),
  isAdmin: boolean('isAdmin').notNull().default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// --- App tables ------------------------------------------------------------

export const category = pgTable('category', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  color: text('color').notNull().default('#ffffff'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const transaction = pgTable('transaction', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  type: text('type').notNull(), // 'income' | 'expense'
  categoryId: integer('categoryId').references(() => category.id, { onDelete: 'set null' }),
  description: text('description'),
  date: date('date').notNull().defaultNow(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const server = pgTable('server', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  image: text('image'),
  ownerId: text('ownerId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const serverMember = pgTable('server_member', {
  id: serial('id').primaryKey(),
  serverId: integer('serverId')
    .notNull()
    .references(() => server.id, { onDelete: 'cascade' }),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  role: text('role').notNull().default('member'), // 'owner' | 'moderator' | 'member'
  isBanned: boolean('isBanned').notNull().default(false),
  isMuted: boolean('isMuted').notNull().default(false),
  joinedAt: timestamp('joinedAt').notNull().defaultNow(),
})

export const message = pgTable('message', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  imageUrl: text('imageUrl'),
  serverId: integer('serverId')
    .notNull()
    .references(() => server.id, { onDelete: 'cascade' }),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})
