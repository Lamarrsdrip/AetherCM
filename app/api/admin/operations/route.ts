import {NextResponse} from 'next/server'
import {applyDailyAccrualIfDue,getStore,sweepExpiredCryptoRequests} from '@/lib/store'

export async function GET(){
  sweepExpiredCryptoRequests()
  return NextResponse.json(applyDailyAccrualIfDue())
}
export async function POST(req:Request){
 const body=await req.json(); const s=getStore()
 if(body.action==='allocation-status')s.allocations=s.allocations.map(a=>a.id===body.id?{...a,status:body.status}:a)
 if(body.action==='transfer-status')s.transfers=s.transfers.map(t=>t.id===body.id?{...t,status:body.status}:t)
 if(body.action==='adjust-balance'){
   const amount=Number(body.amount||0)
   if(!Number.isFinite(amount)||amount===0)return NextResponse.json({error:'Enter a non-zero amount.'},{status:400})
   s.adjustments.unshift({id:`ADJ-${Date.now()}`,userId:body.userId||'AC-20491',userName:body.userName||'Maya Chen',amount,kind:amount>0?'Credit':'Debit',note:String(body.note||'Admin account adjustment'),createdAt:new Date().toLocaleString()})
 }
 if(body.action==='daily-gain'){s.dailyGain={...s.dailyGain,...body.rule,value:body.rule?.value===undefined?s.dailyGain.value:Number(body.rule.value)};if(body.rule?.enabled===true)s.lastAccrualDate=null}
 if(body.action==='share-control')s.shareControls=s.shareControls.map(x=>x.symbol===body.symbol?{...x,...body.patch,manualPrice:body.patch?.manualPrice===undefined?x.manualPrice:Number(body.patch.manualPrice)}:x)
 if(body.action==='funding-method')s.fundingMethods=s.fundingMethods.map(x=>x.id===body.id?{...x,...body.patch}:x)
 if(body.action==='crypto-gateway')s.cryptoGateway={...s.cryptoGateway,...body.patch,paymentWindowMinutes:body.patch?.paymentWindowMinutes===undefined?s.cryptoGateway.paymentWindowMinutes:Number(body.patch.paymentWindowMinutes)}
 if(body.action==='crypto-address')s.cryptoGateway.addresses=s.cryptoGateway.addresses.map(x=>x.id===body.id?{...x,...body.patch,minDeposit:body.patch?.minDeposit===undefined?x.minDeposit:Number(body.patch.minDeposit)}:x)
 if(body.action==='crypto-address-add'){
   s.cryptoGateway.addresses.push({
     id:`CR-${Date.now()}`,asset:String(body.asset||'USDT').toUpperCase(),network:String(body.network||'TRC20'),
     address:String(body.address||''),enabled:true,minDeposit:Number(body.minDeposit||50),confirmationsLabel:'Manual verification'
   })
 }
 return NextResponse.json(applyDailyAccrualIfDue())
}
