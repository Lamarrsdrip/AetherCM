import {NextResponse} from 'next/server'
import {getStore,sweepExpiredCryptoRequests} from '@/lib/store'

export async function GET(){
  sweepExpiredCryptoRequests()
  const s=getStore()
  return NextResponse.json({methods:s.fundingMethods,requests:s.transfers,cryptoGateway:s.cryptoGateway})
}

export async function POST(req:Request){
  const b=await req.json(); const s=getStore(); const amount=Number(b.amount||0)
  const direction=b.direction==='Withdrawal'?'Withdrawal' as const:'Deposit' as const
  const method=s.fundingMethods.find(m=>m.id===b.method&&m.enabled)
  if(!method)return NextResponse.json({error:'Funding method unavailable.'},{status:400})
  if(!Number.isFinite(amount)||amount<=0)return NextResponse.json({error:'Enter a valid amount.'},{status:400})

  let depositAddress:string|undefined
  let network:string|undefined
  let expiresAt:string|undefined

  if(b.method==='crypto'){
    if(!s.cryptoGateway.enabled)return NextResponse.json({error:'Crypto gateway is currently disabled.'},{status:400})
    const address=s.cryptoGateway.addresses.find(a=>a.enabled&&a.asset===b.asset&&a.network===b.network)
    if(!address)return NextResponse.json({error:'Selected crypto network is unavailable.'},{status:400})
    if(amount<address.minDeposit)return NextResponse.json({error:`Minimum ${address.asset} deposit is $${address.minDeposit}.`},{status:400})
    depositAddress=address.address
    network=address.network
    if(direction==='Deposit'){
      expiresAt=new Date(Date.now()+s.cryptoGateway.paymentWindowMinutes*60*1000).toISOString()
    }
  }

  const item={
    id:`TR-${Date.now()}`,userId:'AC-20491',userName:'Maya Chen',
    direction,method:b.method,asset:b.asset||undefined,network,amount,
    reference:String(b.reference||''),destination:String(b.destination||''),
    depositAddress,expiresAt,status:'Pending' as const,createdAt:new Date().toLocaleString()
  }
  s.transfers.unshift(item)
  return NextResponse.json({ok:true,item})
}
