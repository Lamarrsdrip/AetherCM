import { NextResponse } from 'next/server'
import { cleanEmail, assertTrustedOrigin } from '@/lib/security'
import { getCredential, createPasswordReset } from '@/lib/credentials'
import { sendEmail } from '@/lib/email'

export async function POST(req:Request){
  try{assertTrustedOrigin(req)}catch{return NextResponse.json({ok:true})}
  const body=await req.json().catch(()=>({}))
  let email:string
  try{email=cleanEmail(body.email)}catch{return NextResponse.json({ok:true})}
  const credential=await getCredential(email)
  if(credential){
    const token=await createPasswordReset(email)
    const origin=new URL(req.url).origin
    const url=`${process.env.APP_URL||origin}/reset-password?token=${encodeURIComponent(token)}`
    await sendEmail({
      to:email,subject:'Reset your Aether password',title:'Reset your password',
      text:`Use the link below within 30 minutes to choose a new password:\n\n${url}\n\nIf you did not request this, you can ignore this message.`
    }).catch(()=>{})
  }
  return NextResponse.json({ok:true,message:'If the email belongs to an Aether account, reset instructions have been sent.'})
}
