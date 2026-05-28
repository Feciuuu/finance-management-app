import { redirect } from 'next/navigation'

export default function MessagesRoute() {
  // Redirect to servers page - messages are server-based
  redirect('/dashboard/servers')
}
