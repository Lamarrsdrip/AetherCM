import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { assertTrustedOrigin, cleanText } from '@/lib/security'
import { loadState, saveState, ensureAccount } from '@/lib/store'
import type { Address } from '@/lib/ops'

export async function GET(){
  const session=await getSession()
  if(!session)return NextResponse.json({error:'Please sign in.'},{status:401})
  if(session.role!=='client')return NextResponse.json({error:'Not available for this account.'},{status:400})
  const state=await loadState()
  const account=ensureAccount(state,session.email)
  return NextResponse.json({account})
}

function cleanAddress(input:any):Address|undefined{
  if(!input||typeof input!=='object')return undefined
  const line1=cleanText(input.line1,120)
  const city=cleanText(input.city,80)
  const country=cleanText(input.country,80)
  if(!line1&&!city&&!country)return undefined
  return {
    line1,city,country,
    line2:cleanText(input.line2,120)||undefined,
    state:cleanText(input.state,80)||undefined,
    postalCode:cleanText(input.postalCode,20)||undefined,
  }
}

export async function POST(req:Request){
  const session=await getSession()
  if(!session)return NextResponse.json({error:'Please sign in.'},{status:401})
  if(session.role!=='client')return NextResponse.json({error:'Not available for this account.'},{status:400})
  try{assertTrustedOrigin(req)}catch{return NextResponse.json({error:'Please refresh and try again.'},{status:403})}
  const b=await req.json().catch(()=>({}))

  const state=await loadState()
  const account=ensureAccount(state,session.email)

  if(b.name!==undefined){
    const name=cleanText(b.name,80)
    if(name.length<2)return NextResponse.json({error:'Enter your full name.'},{status:400})
    account.name=name
  }
  if(b.phone!==undefined)account.phone=cleanText(b.phone,30)||undefined
  if(b.avatarUrl!==undefined)account.avatarUrl=cleanText(b.avatarUrl,500)||undefined
  if(b.address!==undefined)account.address=cleanAddress(b.address)
  if(b.notificationPreferences&&typeof b.notificationPreferences==='object'){
    const p=b.notificationPreferences
    account.notificationPreferences={
      email:p.email!==false,push:p.push!==false,
      investmentUpdates:p.investmentUpdates!==false,transferUpdates:p.transferUpdates!==false,supportReplies:p.supportReplies!==false
    }
  }
  account.updatedAt=new Date().toISOString()

  await saveState(state)
  return NextResponse.json({ok:true,account})
}
