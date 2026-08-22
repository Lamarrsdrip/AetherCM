import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { emailStatus } from '@/lib/email'
import { pushStatus } from '@/lib/push'
import { databaseConfigured } from '@/lib/db'
export async function GET(){
  const session=await getSession()
  if(session?.role!=='admin')return NextResponse.json({error:'Administrator access required.'},{status:401})
  return NextResponse.json({
    database:{connected:databaseConfigured()},
    email:await emailStatus(),
    push:{configured:pushStatus().configured},
    install:{configured:true}
  })
}
