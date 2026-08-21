import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { assertTrustedOrigin } from '@/lib/security'
import { loadState, saveState, ensureAccount, availableToAllocate } from '@/lib/store'
import { createNotice } from '@/lib/notify'
import { sendEmail } from '@/lib/email'

export async function GET(){
  const session=await getSession()
  if(!session)return NextResponse.json({error:'Please sign in.'},{status:401})
  const state=await loadState(),account=ensureAccount(state,session.email)
  return NextResponse.json({requests:state.allocations.filter(x=>x.userId===account.id),shareControls:state.shareControls,available:availableToAllocate(state,account.id)})
}

export async function POST(req:Request){
  const session=await getSession()
  if(!session)return NextResponse.json({error:'Please sign in.'},{status:401})
  try{assertTrustedOrigin(req)}catch{return NextResponse.json({error:'Please refresh and try again.'},{status:403})}
  const b=await req.json().catch(()=>({}))
  const state=await loadState(),account=ensureAccount(state,session.email),amount=Number(b.amount||0)
  const ctl=state.shareControls.find(x=>x.symbol===b.symbol)
  if(!ctl?.enabled)return NextResponse.json({error:'This investment is not currently available.'},{status:400})
  if(!Number.isFinite(amount)||amount<ctl.minAmount||amount>ctl.maxAmount)return NextResponse.json({error:`Enter an amount between $${ctl.minAmount.toLocaleString()} and $${ctl.maxAmount.toLocaleString()}.`},{status:400})
  if(amount>availableToAllocate(state,account.id))return NextResponse.json({error:'You do not have enough available cash for this request.'},{status:400})
  const shares=Number((amount/ctl.manualPrice).toFixed(6))
  if(shares>ctl.maxShares)return NextResponse.json({error:'This request is above the current share limit.'},{status:400})

  const item={
    id:`AL-${Date.now()}`,userId:account.id,userName:account.name,
    symbol:ctl.symbol,name:ctl.name,requestedAmount:amount,shares,price:ctl.manualPrice,value:amount,
    status:ctl.approvalRequired?'Pending' as const:'Approved' as const,createdAt:new Date().toISOString()
  }
  state.allocations.unshift(item)
  await saveState(state)

  await createNotice({userId:account.id,title:'Investment request received',body:`Your ${ctl.symbol} request for $${amount.toLocaleString()} has been received.`,href:'/portfolio'}).catch(()=>{})
  if(process.env.SUPPORT_EMAIL)await sendEmail({to:process.env.SUPPORT_EMAIL,subject:'Investment request received',title:'Investment request',text:`${account.name} requested $${amount.toLocaleString()} of ${ctl.symbol}.`}).catch(()=>{})
  return NextResponse.json({ok:true,item,available:availableToAllocate(state,account.id)})
}
