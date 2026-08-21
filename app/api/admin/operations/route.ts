import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { assertTrustedOrigin, cleanText } from '@/lib/security'
import { loadState, saveState, sweepExpiredCryptoRequests, accountById } from '@/lib/store'
import { createNotice } from '@/lib/notify'

async function admin(){
  const s=await getSession()
  return s?.role==='admin'
}

export async function GET(){
  if(!await admin())return NextResponse.json({error:'Administrator access required.'},{status:401})
  const state=await loadState()
  if(sweepExpiredCryptoRequests(state))await saveState(state)
  return NextResponse.json(state)
}

export async function POST(req:Request){
  if(!await admin())return NextResponse.json({error:'Administrator access required.'},{status:401})
  try{assertTrustedOrigin(req)}catch{return NextResponse.json({error:'Please refresh and try again.'},{status:403})}
  const b=await req.json().catch(()=>({})),state=await loadState()
  let notice:{userId:string;title:string;body:string;href:string;email?:string}|null=null

  if(b.action==='allocation-status'){
    const found=state.allocations.find(a=>a.id===b.id)
    if(found){
      found.status=b.status
      const account=accountById(state,found.userId)
      notice={userId:found.userId,title:`Investment request ${String(b.status).toLowerCase()}`,body:`Your ${found.symbol} investment request is now ${String(b.status).toLowerCase()}.`,href:'/portfolio',email:account?.email}
    }
  }
  if(b.action==='transfer-status'){
    const found=state.transfers.find(t=>t.id===b.id)
    if(found){
      found.status=b.status
      const account=accountById(state,found.userId)
      notice={userId:found.userId,title:`${found.direction} ${String(b.status).toLowerCase()}`,body:`Your ${found.direction.toLowerCase()} request for $${found.amount.toLocaleString()} is now ${String(b.status).toLowerCase()}.`,href:'/transfers',email:account?.email}
    }
  }
  if(b.action==='adjust-balance'){
    const amount=Number(b.amount||0)
    if(!Number.isFinite(amount)||amount===0)return NextResponse.json({error:'Enter a non-zero amount.'},{status:400})
    const account=accountById(state,b.userId)
    if(!account)return NextResponse.json({error:'Client account not found.'},{status:404})
    state.adjustments.unshift({id:`ADJ-${Date.now()}`,userId:account.id,userName:account.name,amount,kind:amount>0?'Credit':'Debit',note:cleanText(b.note,180)||'Account adjustment',createdAt:new Date().toISOString()})
    notice={userId:account.id,title:'Account balance updated',body:`Your account balance has been updated by ${amount>0?'+':''}$${Math.abs(amount).toLocaleString()}.`,href:'/dashboard',email:account.email}
  }
  if(b.action==='daily-gain'){
    state.dailyGain={...state.dailyGain,...b.rule,value:b.rule?.value===undefined?state.dailyGain.value:Number(b.rule.value)}
  }
  if(b.action==='share-control'){
    state.shareControls=state.shareControls.map(x=>{
      if(x.symbol!==b.symbol)return x
      const p={...b.patch}
      if(p.manualPrice!==undefined){p.previousPrice=x.manualPrice;p.manualPrice=Number(p.manualPrice)}
      if(p.marketCap!==undefined)p.marketCap=Number(p.marketCap)
      return {...x,...p}
    })
  }
  if(b.action==='funding-method')state.fundingMethods=state.fundingMethods.map(x=>x.id===b.id?{...x,...b.patch}:x)
  if(b.action==='crypto-gateway')state.cryptoGateway={...state.cryptoGateway,...b.patch,paymentWindowMinutes:b.patch?.paymentWindowMinutes===undefined?state.cryptoGateway.paymentWindowMinutes:Number(b.patch.paymentWindowMinutes)}
  if(b.action==='crypto-address')state.cryptoGateway.addresses=state.cryptoGateway.addresses.map(x=>x.id===b.id?{...x,...b.patch,minDeposit:b.patch?.minDeposit===undefined?x.minDeposit:Number(b.patch.minDeposit)}:x)
  if(b.action==='site-content')state.siteContent={...state.siteContent,...b.patch,offers:b.patch?.offers||state.siteContent.offers}

  await saveState(state)
  if(notice)await createNotice(notice).catch(()=>{})
  return NextResponse.json(state)
}
