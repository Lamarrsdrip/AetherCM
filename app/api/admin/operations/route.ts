import{NextResponse}from'next/server';import{getStore,sweepExpiredCryptoRequests}from'@/lib/store'
export async function GET(){sweepExpiredCryptoRequests();return NextResponse.json(getStore())}
export async function POST(req:Request){const b=await req.json(),s=getStore()
 if(b.action==='allocation-status')s.allocations=s.allocations.map(a=>a.id===b.id?{...a,status:b.status}:a)
 if(b.action==='transfer-status')s.transfers=s.transfers.map(t=>t.id===b.id?{...t,status:b.status}:t)
 if(b.action==='adjust-balance'){const amount=Number(b.amount||0);if(!amount)return NextResponse.json({error:'Enter a non-zero amount.'},{status:400});s.adjustments.unshift({id:`ADJ-${Date.now()}`,userId:b.userId,userName:b.userName,amount,kind:amount>0?'Credit':'Debit',note:String(b.note||'Admin account adjustment'),createdAt:new Date().toLocaleString()})}
 if(b.action==='daily-gain')s.dailyGain={...s.dailyGain,...b.rule,value:b.rule?.value===undefined?s.dailyGain.value:Number(b.rule.value)}
 if(b.action==='share-control')s.shareControls=s.shareControls.map(x=>{if(x.symbol!==b.symbol)return x;const p={...b.patch};if(p.manualPrice!==undefined){p.previousPrice=x.manualPrice;p.manualPrice=Number(p.manualPrice)}if(p.marketCap!==undefined)p.marketCap=Number(p.marketCap);return{...x,...p}})
 if(b.action==='funding-method')s.fundingMethods=s.fundingMethods.map(x=>x.id===b.id?{...x,...b.patch}:x)
 if(b.action==='crypto-gateway')s.cryptoGateway={...s.cryptoGateway,...b.patch,paymentWindowMinutes:b.patch?.paymentWindowMinutes===undefined?s.cryptoGateway.paymentWindowMinutes:Number(b.patch.paymentWindowMinutes)}
 if(b.action==='crypto-address')s.cryptoGateway.addresses=s.cryptoGateway.addresses.map(x=>x.id===b.id?{...x,...b.patch,minDeposit:b.patch?.minDeposit===undefined?x.minDeposit:Number(b.patch.minDeposit)}:x)
 if(b.action==='site-content')s.siteContent={...s.siteContent,...b.patch,offers:b.patch?.offers||s.siteContent.offers}
 return NextResponse.json(s)
}