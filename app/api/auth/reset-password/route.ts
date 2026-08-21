import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { assertTrustedOrigin } from '@/lib/security'
import { consumePasswordReset, updatePassword } from '@/lib/credentials'

export async function POST(req:Request){
  try{assertTrustedOrigin(req)}catch{return NextResponse.json({error:'Please refresh the page and try again.'},{status:403})}
  const body=await req.json().catch(()=>({}))
  const token=String(body.token||'')
  const password=String(body.password||'')
  if(password.length<10)return NextResponse.json({error:'Use at least 10 characters for your password.'},{status:400})
  const email=await consumePasswordReset(token)
  if(!email)return NextResponse.json({error:'This reset link is invalid or has expired.'},{status:400})
  await updatePassword(email,await bcrypt.hash(password,12))
  return NextResponse.json({ok:true})
}
