import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { timingSafeEqual } from 'crypto'
import { cleanEmail, assertTrustedOrigin } from '@/lib/security'
import { getCredential } from '@/lib/credentials'
import { loadState, ensureAccount, saveState } from '@/lib/store'
import { signSession, sessionCookieName, sessionCookieOptions } from '@/lib/session'

function safeEqual(a:string,b:string){
  const aa=Buffer.from(a),bb=Buffer.from(b)
  return aa.length===bb.length && timingSafeEqual(aa,bb)
}

export async function POST(req:Request){
  try{assertTrustedOrigin(req)}catch{return NextResponse.json({error:'Please refresh the page and try again.'},{status:403})}
  const body=await req.json().catch(()=>({}))
  let email:string
  try{email=cleanEmail(body.email)}catch{return NextResponse.json({error:'Enter a valid email address.'},{status:400})}
  const password=String(body.password||'')
  if(!password)return NextResponse.json({error:'Enter your password.'},{status:400})

  const adminEmail=(process.env.ADMIN_EMAIL||'admin@aethercm.local').toLowerCase()
  if(email===adminEmail){
    const adminPassword=process.env.ADMIN_PASSWORD || (process.env.NODE_ENV!=='production'?'AetherAdmin!2026':'')
    if(!adminPassword)return NextResponse.json({error:'Administrator sign-in has not been set up yet.'},{status:503})
    if(!safeEqual(password,adminPassword))return NextResponse.json({error:'Email or password is incorrect.'},{status:401})
    const token=await signSession({role:'admin',email,userId:'__admin__'})
    const res=NextResponse.json({ok:true,role:'admin'})
    res.cookies.set(sessionCookieName,token,sessionCookieOptions)
    return res
  }

  const credential=await getCredential(email)
  if(!credential)return NextResponse.json({error:'Email or password is incorrect. If this is an older account, choose Forgot password.'},{status:401})
  const ok=await bcrypt.compare(password,credential.passwordHash)
  if(!ok)return NextResponse.json({error:'Email or password is incorrect.'},{status:401})

  const state=await loadState()
  const account=ensureAccount(state,email)
  if(account.status==='FROZEN')return NextResponse.json({error:'This account is temporarily unavailable. Please contact Aether Support.'},{status:403})
  account.lastLoginAt=new Date().toISOString()
  await saveState(state)

  const token=await signSession({role:'client',email,userId:account.id})
  const res=NextResponse.json({ok:true,role:'client'})
  res.cookies.set(sessionCookieName,token,sessionCookieOptions)
  return res
}
