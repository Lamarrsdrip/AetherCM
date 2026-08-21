import { cookies } from 'next/headers'
import { sessionCookieName, verifySession } from './session'

export async function getSession(){
  const store=await cookies()
  return await verifySession(store.get(sessionCookieName)?.value)
}
