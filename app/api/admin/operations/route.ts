import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { assertTrustedOrigin, cleanText } from '@/lib/security'
import { loadState, saveState, sweepExpiredCryptoRequests, accountById, ensureDailyWindow, notifyFlags } from '@/lib/store'
import { createNotice } from '@/lib/notify'
import type { AdjustmentKind } from '@/lib/ops'

async function admin(){
  const s=await getSession()
  return s?.role==='admin'
}

export async function GET(){
  if(!await admin())return NextResponse.json({error:'Administrator access required.'},{status:401})
  const state=await loadState()
  if(sweepExpiredCryptoRequests(state))await saveState(state)
  return NextResponse.json({
    ...state,
    emailConfig:{...state.emailConfig,appPassword:state.emailConfig.appPassword?'••••••••••••••••':''}
  })
}

export async function POST(req:Request){
  if(!await admin())return NextResponse.json({error:'Administrator access required.'},{status:401})
  try{assertTrustedOrigin(req)}catch{return NextResponse.json({error:'Please refresh and try again.'},{status:403})}
  const b=await req.json().catch(()=>({})),state=await loadState()
  let notice:{userId:string;title:string;body:string;href:string;email?:string;sendPush?:boolean;sendEmailNotice?:boolean}|null=null

  if(b.action==='allocation-status'){
    const found=state.allocations.find(a=>a.id===b.id)
    if(found){
      const wasPending=found.status==='Pending'
      if(!wasPending && found.status===b.status){
        // Already in this state — ignore repeat clicks so we never re-notify or re-stamp timestamps.
      } else {
        found.status=b.status
        if(b.status==='Approved' && wasPending){
          const now=new Date().toISOString()
          found.approvedAt=now
          found.purchasedAt=now
        }
        const account=accountById(state,found.userId)
        notice={userId:found.userId,title:`Investment request ${String(b.status).toLowerCase()}`,body:`Your ${found.symbol} investment request is now ${String(b.status).toLowerCase()}.`,href:'/portfolio',email:account?.email,...(account?notifyFlags(account,'investmentUpdates'):{})}
      }
    }
  }
  if(b.action==='transfer-status'){
    const found=state.transfers.find(t=>t.id===b.id)
    if(found){
      found.status=b.status
      const account=accountById(state,found.userId)
      notice={userId:found.userId,title:`${found.direction} ${String(b.status).toLowerCase()}`,body:`Your ${found.direction.toLowerCase()} request for $${found.amount.toLocaleString()} is now ${String(b.status).toLowerCase()}.`,href:'/transfers',email:account?.email,...(account?notifyFlags(account,'transferUpdates'):{})}
    }
  }
  if(b.action==='adjust-balance'){
    const rawAmount=Math.abs(Number(b.amount||0))
    const kind:AdjustmentKind=b.kind
    const validKinds:AdjustmentKind[]=['Daily Profit','Daily Loss','Account Credit','Account Debit']
    if(!validKinds.includes(kind))return NextResponse.json({error:'Choose a valid action type.'},{status:400})
    if(!Number.isFinite(rawAmount)||rawAmount===0)return NextResponse.json({error:'Enter a non-zero amount.'},{status:400})
    const account=accountById(state,b.userId)
    if(!account)return NextResponse.json({error:'Client account not found.'},{status:404})
    ensureDailyWindow(state,account.id)
    const amount=(kind==='Daily Loss'||kind==='Account Debit')?-rawAmount:rawAmount
    state.adjustments.unshift({id:`ADJ-${Date.now()}`,userId:account.id,userName:account.name,amount,kind,note:cleanText(b.note,180)||'Account adjustment',createdAt:new Date().toISOString()})
    const label=kind==='Daily Profit'?'Daily profit':kind==='Daily Loss'?'Daily loss':kind==='Account Credit'?'Account credit':'Account debit'
    const category=(kind==='Daily Profit'||kind==='Daily Loss')?'investmentUpdates':'transferUpdates'
    notice={userId:account.id,title:`${label} applied`,body:`${label}: ${amount>0?'+':''}$${Math.abs(amount).toLocaleString()}.`,href:'/dashboard',email:account.email,...notifyFlags(account,category)}
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
  if(b.action==='company-profile')state.companyProfile={...state.companyProfile,...b.patch}
  if(b.action==='social-links')state.socialLinks={...state.socialLinks,...b.patch}
  if(b.action==='email-config'){
    const patch=b.patch||{}
    const newPassword=typeof patch.appPassword==='string' && patch.appPassword.trim() && !patch.appPassword.includes('•')
      ? patch.appPassword.trim() : state.emailConfig.appPassword
    state.emailConfig={
      enabled:Boolean(patch.enabled),
      gmailAddress:cleanText(patch.gmailAddress,190).toLowerCase(),
      fromName:cleanText(patch.fromName,80)||'Aether Capital Markets',
      appPassword:newPassword
    }
  }
  await saveState(state)
  if(notice)await createNotice(notice).catch(()=>{})
  return NextResponse.json({
    ...state,
    emailConfig:{...state.emailConfig,appPassword:state.emailConfig.appPassword?'••••••••••••••••':''}
  })
}
