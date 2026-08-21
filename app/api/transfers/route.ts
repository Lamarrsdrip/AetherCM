import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { assertTrustedOrigin, cleanText } from '@/lib/security'
import { loadState, saveState, ensureAccount, accountSnapshotByUser, sweepExpiredCryptoRequests } from '@/lib/store'
import { createNotice } from '@/lib/notify'
import { sendEmail } from '@/lib/email'

export async function GET(){
  const session=await getSession()
  if(!session)return NextResponse.json({error:'Please sign in.'},{status:401})
  const state=await loadState(),account=ensureAccount(state,session.email)
  if(sweepExpiredCryptoRequests(state))await saveState(state)
  return NextResponse.json({methods:state.fundingMethods,requests:state.transfers.filter(x=>x.userId===account.id),cryptoGateway:state.cryptoGateway,available:accountSnapshotByUser(state,account.id).available})
}

export async function POST(req:Request){
  const session=await getSession()
  if(!session)return NextResponse.json({error:'Please sign in.'},{status:401})
  try{assertTrustedOrigin(req)}catch{return NextResponse.json({error:'Please refresh and try again.'},{status:403})}
  const b=await req.json().catch(()=>({}))
  const state=await loadState(),account=ensureAccount(state,session.email)
  const amount=Number(b.amount||0),direction=b.direction==='Withdrawal'?'Withdrawal' as const:'Deposit' as const
  const method=state.fundingMethods.find(m=>m.id===b.method&&m.enabled)
  if(!method)return NextResponse.json({error:'This payment method is not currently available.'},{status:400})
  if(!Number.isFinite(amount)||amount<=0)return NextResponse.json({error:'Enter a valid amount.'},{status:400})
  if(direction==='Withdrawal'&&amount>accountSnapshotByUser(state,account.id).available)return NextResponse.json({error:'This amount is above your available cash.'},{status:400})

  let depositAddress:string|undefined,network:string|undefined,expiresAt:string|undefined
  if(b.method==='crypto'){
    if(!state.cryptoGateway.enabled)return NextResponse.json({error:'Crypto funding is not currently available.'},{status:400})
    const addr=state.cryptoGateway.addresses.find(x=>x.enabled&&x.asset===b.asset&&x.network===b.network)
    if(!addr)return NextResponse.json({error:'This asset or network is not currently available.'},{status:400})
    if(addr.address.startsWith('ADMIN_SET_'))return NextResponse.json({error:'This deposit option is being updated. Please choose another option or contact support.'},{status:503})
    if(direction==='Deposit'&&amount<addr.minDeposit)return NextResponse.json({error:`The minimum deposit is $${addr.minDeposit.toLocaleString()}.`},{status:400})
    depositAddress=addr.address;network=addr.network
    if(direction==='Deposit')expiresAt=new Date(Date.now()+state.cryptoGateway.paymentWindowMinutes*60000).toISOString()
  }

  const item={
    id:`TR-${Date.now()}`,userId:account.id,userName:account.name,direction,method:b.method,
    asset:b.asset||undefined,network,amount,reference:cleanText(b.reference,250),destination:cleanText(b.destination,250),
    depositAddress,expiresAt,status:'Pending' as const,createdAt:new Date().toISOString()
  }
  state.transfers.unshift(item)
  await saveState(state)
  await createNotice({userId:account.id,title:`${direction} request received`,body:`Your ${direction.toLowerCase()} request for $${amount.toLocaleString()} has been received.`,href:'/transfers'}).catch(()=>{})
  if(process.env.SUPPORT_EMAIL)await sendEmail({to:process.env.SUPPORT_EMAIL,subject:`Aether ${direction.toLowerCase()} request`,title:`${direction} request`,text:`${account.name} submitted a ${direction.toLowerCase()} request for $${amount.toLocaleString()} using ${method.label}.`}).catch(()=>{})
  return NextResponse.json({ok:true,item})
}
