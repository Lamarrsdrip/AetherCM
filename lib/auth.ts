import { cookies } from 'next/headers'

export async function getSession() {
  const store = await cookies()
  const role = store.get('aether_role')?.value
  const email = store.get('aether_email')?.value
  return role && email ? { role, email } : null
}
