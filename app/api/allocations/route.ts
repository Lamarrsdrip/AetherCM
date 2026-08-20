import {NextResponse} from 'next/server'
import {getStore} from '@/lib/store'

export async function GET(){const s=getStore();return NextResponse.json({requests:s.allocations,shareControls:s.shareControls})}
export async function POST(req:Request){
  const b=await req.json(); const s=getStore(); const amount=Number(b.amount||0)
  if(!b.symbol||!Number.isFinite(amount)||amount<=0) return NextResponse.json({error:'Enter a valid amount.'},{status:400})
  const ctl=s.shareControls.find(x=>x.symbol===b.symbol)
  if(!ctl?.enabled) return NextResponse.json({error:'This asset is not available for allocation.'},{status:400})
  if(amount<ctl.minAmount||amount>ctl.maxAmount) return NextResponse.json({error:`Allowed amount is $${ctl.minAmount.toLocaleString()}–$${ctl.maxAmount.toLocaleString()}.`},{status:400})
  const shares=Number((amount/ctl.manualPrice).toFixed(6))
  if(shares>ctl.maxShares) return NextResponse.json({error:`This request exceeds the admin share limit of ${ctl.maxShares}.`},{status:400})
  const item={
    id:`AL-${Date.now()}`,userId:'AC-20491',userName:'Maya Chen',symbol:ctl.symbol,name:ctl.name,
    requestedAmount:amount,shares,price:ctl.manualPrice,value:amount,
    status:ctl.approvalRequired?'Pending' as const:'Approved' as const,createdAt:new Date().toLocaleString()
  }
  s.allocations.unshift(item); return NextResponse.json({ok:true,item})
}
