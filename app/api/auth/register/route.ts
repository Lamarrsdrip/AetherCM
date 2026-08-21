import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { cleanEmail, cleanText, assertTrustedOrigin } from '@/lib/security'
import { loadState, saveState, ensureAccount } from '@/lib/store'
import { createCredential, getCredential } from '@/lib/credentials'
import { signSession, sessionCookieName, sessionCookieOptions } from '@/lib/session'
import { createNotice } from '@/lib/notify'
import { sendEmail } from '@/lib/email'

export async function POST(req:Request){
  try{assertTrustedOrigin(req)}catch{return NextResponse.json({error:'Please refresh the page and try again.'},{status:403})}
  const body=await req.json().catch(()=>({}))
  let email:string
  try{email=cleanEmail(body.email)}catch{return NextResponse.json({error:'Enter a valid email address.'},{status:400})}
  const name=cleanText(body.name,80)
  const password=String(body.password||'')
  if(name.length<2)return NextResponse.json({error:'Enter your full name.'},{status:400})
  if(password.length<10)return NextResponse.json({error:'Use at least 10 characters for your password.'},{status:400})
  if(await getCredential(email))return NextResponse.json({error:'An account already exists for this email.'},{status:409})

  const state=await loadState()
  const account=ensureAccount(state,email,name)
  const passwordHash=await bcrypt.hash(password,12)
  try{
    await createCredential(email,account.id,passwordHash)
    await saveState(state)
  }catch(e:any){
    if(e?.message==='ACCOUNT_EXISTS')return NextResponse.json({error:'An account already exists for this email.'},{status:409})
    throw e
  }

  const token=await signSession({role:'client',email,userId:account.id})
  const res=NextResponse.json({ok:true,role:'client'})
  res.cookies.set(sessionCookieName,token,sessionCookieOptions)

  await sendEmail({
    to:email,
    subject:'Welcome to Aether',
    title:`Welcome, ${account.name.split(' ')[0]}`,
    text:'Your Aether account is ready. You can now sign in, fund your account, review markets and manage your portfolio from one place.'
  }).catch(()=>{})

  const support=process.env.SUPPORT_EMAIL
  if(support){
    await sendEmail({to:support,subject:'New Aether account',title:'New client account',text:`${account.name} created an Aether account using ${email}.`}).catch(()=>{})
  }
  await createNotice({userId:account.id,title:'Welcome to Aether',body:'Your account is ready. Start by reviewing your account and funding options.',href:'/dashboard'}).catch(()=>{})
  return res
}
