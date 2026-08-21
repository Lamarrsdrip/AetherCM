import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { assertTrustedOrigin } from '@/lib/security'
import { savePushSubscription, pushStatus } from '@/lib/push'
export async function POST(req:Request){
  const session=await getSession()
  if(!session)return NextResponse.json({error:'Please sign in.'},{status:401})
  if(!pushStatus().configured)return NextResponse.json({error:'Account alerts are not available yet.'},{status:503})
  try{assertTrustedOrigin(req)}catch{return NextResponse.json({error:'Please refresh and try again.'},{status:403})}
  const subscription=await req.json()
  await savePushSubscription(session.userId,subscription)
  return NextResponse.json({ok:true})
}
