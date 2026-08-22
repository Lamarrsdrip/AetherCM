import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { assertTrustedOrigin } from '@/lib/security'
import { sendEmail } from '@/lib/email'
export async function POST(req:Request){
  const session=await getSession()
  if(session?.role!=='admin')return NextResponse.json({error:'Administrator access required.'},{status:401})
  try{assertTrustedOrigin(req)}catch{return NextResponse.json({error:'Please refresh and try again.'},{status:403})}
  const to=process.env.SUPPORT_EMAIL||session.email
  const result=await sendEmail({to,subject:'Aether email check',title:'Email is connected',text:'Aether can send account emails successfully.'})
  if(!result.sent){
    const reason=result.reason==='not-configured'
      ?'Email is not connected yet.'
      :`Email attempt failed (${result.reason}). Double-check the Gmail address and app password.`
    return NextResponse.json({error:reason},{status:503})
  }
  return NextResponse.json({ok:true,to})
}
