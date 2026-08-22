import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSession } from '@/lib/auth'
import { assertTrustedOrigin } from '@/lib/security'
import { getCredential, updatePassword } from '@/lib/credentials'
import { createNotice } from '@/lib/notify'

export async function POST(req:Request){
  const session=await getSession()
  if(!session)return NextResponse.json({error:'Please sign in.'},{status:401})
  if(session.role!=='client')return NextResponse.json({error:'Administrator passwords are managed by your deployment configuration.'},{status:400})
  try{assertTrustedOrigin(req)}catch{return NextResponse.json({error:'Please refresh and try again.'},{status:403})}

  const b=await req.json().catch(()=>({}))
  const currentPassword=String(b.currentPassword||'')
  const newPassword=String(b.newPassword||'')
  const confirmPassword=String(b.confirmPassword||'')

  if(newPassword.length<10)return NextResponse.json({error:'Use at least 10 characters for your new password.'},{status:400})
  if(newPassword!==confirmPassword)return NextResponse.json({error:'New password and confirmation do not match.'},{status:400})

  const credential=await getCredential(session.email)
  if(!credential)return NextResponse.json({error:'We could not find your account credentials.'},{status:404})
  const valid=await bcrypt.compare(currentPassword,credential.passwordHash)
  if(!valid)return NextResponse.json({error:'Current password is incorrect.'},{status:401})

  const newHash=await bcrypt.hash(newPassword,12)
  await updatePassword(session.email,newHash)

  await createNotice({
    userId:session.userId,title:'Your Aether password was changed',
    body:'If you did not make this change, contact Aether Support immediately.',
    href:'/profile/security',email:session.email
  }).catch(()=>{})

  return NextResponse.json({ok:true})
}
