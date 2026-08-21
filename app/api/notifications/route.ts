import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { assertTrustedOrigin } from '@/lib/security'
import { listNotices, markNoticeRead } from '@/lib/notify'

export async function GET(){
  const session=await getSession()
  if(!session)return NextResponse.json({error:'Please sign in.'},{status:401})
  const notices=await listNotices(session.userId)
  return NextResponse.json({notices,unread:notices.filter(n=>!n.read).length})
}
export async function POST(req:Request){
  const session=await getSession()
  if(!session)return NextResponse.json({error:'Please sign in.'},{status:401})
  try{assertTrustedOrigin(req)}catch{return NextResponse.json({error:'Please refresh and try again.'},{status:403})}
  const b=await req.json().catch(()=>({}))
  await markNoticeRead(session.userId,b.id)
  return NextResponse.json({ok:true})
}
