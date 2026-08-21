import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { assertTrustedOrigin, cleanText } from '@/lib/security'
import { allSupportMessages, addSupportMessage } from '@/lib/support'
import { loadState, accountById } from '@/lib/store'
import { createNotice } from '@/lib/notify'

export async function GET(){
  const session=await getSession()
  if(session?.role!=='admin')return NextResponse.json({error:'Administrator access required.'},{status:401})
  return NextResponse.json({messages:await allSupportMessages()})
}

export async function POST(req:Request){
  const session=await getSession()
  if(session?.role!=='admin')return NextResponse.json({error:'Administrator access required.'},{status:401})
  try{assertTrustedOrigin(req)}catch{return NextResponse.json({error:'Please refresh and try again.'},{status:403})}
  const b=await req.json().catch(()=>({})),text=cleanText(b.text,1500),userId=String(b.userId||'')
  if(!text||!userId)return NextResponse.json({error:'Choose a client and write a reply.'},{status:400})
  const state=await loadState(),account=accountById(state,userId)
  if(!account)return NextResponse.json({error:'Client account not found.'},{status:404})
  const message=await addSupportMessage({userId:account.id,userName:account.name,email:account.email,from:'team',text})
  await createNotice({userId:account.id,title:'Aether Support replied',body:text.slice(0,140),href:'/support',email:account.email}).catch(()=>{})
  return NextResponse.json({ok:true,message})
}
