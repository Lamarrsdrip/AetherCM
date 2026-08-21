import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { assertTrustedOrigin } from '@/lib/security'
import { createNotice } from '@/lib/notify'
export async function POST(req:Request){
  const session=await getSession()
  if(session?.role!=='admin')return NextResponse.json({error:'Administrator access required.'},{status:401})
  try{assertTrustedOrigin(req)}catch{return NextResponse.json({error:'Please refresh and try again.'},{status:403})}
  await createNotice({userId:'__admin__',title:'Aether alerts are working',body:'This is a test account alert.',href:'/admin/communications'})
  return NextResponse.json({ok:true})
}
