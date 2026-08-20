'use client'
import {useEffect,useMemo,useState} from 'react'
import AppShell from '@/components/AppShell'
import type {FundingMethod,TransferRequest,ManualCryptoGateway} from '@/lib/ops'

function Countdown({expiresAt}:{expiresAt?:string}){
 const [left,setLeft]=useState(0)
 useEffect(()=>{const tick=()=>setLeft(expiresAt?Math.max(0,new Date(expiresAt).getTime()-Date.now()):0);tick();const id=setInterval(tick,1000);return()=>clearInterval(id)},[expiresAt])
 const m=Math.floor(left/60000),s=Math.floor((left%60000)/1000)
 return <b className={left>0?'timerLive':'timerExpired'}>{left>0?`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`:'Expired'}</b>
}

export default function Transfers(){
 const [methods,setMethods]=useState<FundingMethod[]>([]),[requests,setRequests]=useState<TransferRequest[]>([])
 const [gateway,setGateway]=useState<ManualCryptoGateway|null>(null)
 const [direction,setDirection]=useState<'Deposit'|'Withdrawal'>('Deposit'),[method,setMethod]=useState<'crypto'|'wire'|'paypal'>('crypto')
 const [amount,setAmount]=useState('1000'),[asset,setAsset]=useState('USDT'),[network,setNetwork]=useState('TRC20')
 const [reference,setReference]=useState(''),[msg,setMsg]=useState(''),[created,setCreated]=useState<TransferRequest|null>(null)
 const load=()=>fetch('/api/transfers').then(r=>r.json()).then(d=>{setMethods(d.methods);setRequests(d.requests.filter((x:TransferRequest)=>x.userId==='AC-20491'));setGateway(d.cryptoGateway)})
 useEffect(()=>{load()},[])
 const active=methods.find(m=>m.id===method)
 const addresses=(gateway?.addresses||[]).filter(a=>a.enabled)
 const assets=Array.from(new Set(addresses.map(a=>a.asset)))
 const networks=addresses.filter(a=>a.asset===asset)
 useEffect(()=>{if(networks.length&&!networks.some(n=>n.network===network))setNetwork(networks[0].network)},[asset,networks.length])
 const selectedAddress=addresses.find(a=>a.asset===asset&&a.network===network)

 const submit=async()=>{
   setMsg('');setCreated(null)
   const r=await fetch('/api/transfers',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({direction,method,amount:Number(amount),asset:method==='crypto'?asset:undefined,network:method==='crypto'?network:undefined,reference})})
   const d=await r.json();if(!r.ok){setMsg(d.error);return}
   setRequests([d.item,...requests]);setCreated(d.item);setMsg(`${direction} request created.`)
 }
 return <AppShell><section className="workspace"><div className="workspaceHead"><div><span className="eyebrow">Money</span><h1>Fund and withdraw.</h1><p>Crypto is the primary funding rail. AetherCM generates a timed manual payment request using the address configured by admin.</p></div></div>
 <div className="transferComposer"><section className="panel"><div className="transferTabs"><button className={direction==='Deposit'?'active':''} onClick={()=>{setDirection('Deposit');setCreated(null)}}>Deposit</button><button className={direction==='Withdrawal'?'active':''} onClick={()=>{setDirection('Withdrawal');setCreated(null)}}>Withdraw</button></div>
 <div className="methodCards">{methods.filter(m=>m.enabled).map(m=><button key={m.id} onClick={()=>{setMethod(m.id);setCreated(null)}} className={method===m.id?'selected':''}><b>{m.label}</b><small>{m.primary?'Primary gateway':'Available method'}</small></button>)}</div>
 <div className="compactForm"><label>Amount<input type="number" value={amount} onChange={e=>setAmount(e.target.value)}/></label>
 {method==='crypto'&&<><label>Asset<select value={asset} onChange={e=>setAsset(e.target.value)}>{assets.map(a=><option key={a}>{a}</option>)}</select></label><label>Network<select value={network} onChange={e=>setNetwork(e.target.value)}>{networks.map(n=><option key={n.network}>{n.network}</option>)}</select></label></>}
 {method==='crypto'&&direction==='Deposit'&&!created&&<div className="fundingInstructions"><small>Manual crypto gateway</small><b>{asset} · {network}</b><p>{gateway?.instructions}</p><p>Minimum: ${selectedAddress?.minDeposit||0} · Payment window: {gateway?.paymentWindowMinutes||30} minutes</p></div>}
 {method!=='crypto'&&<div className="fundingInstructions"><small>{direction==='Deposit'?'Deposit instructions':'Withdrawal method'}</small><b>{active?.label}</b><p>{direction==='Deposit'?active?.instructions:`Submit your ${active?.label} withdrawal destination/reference below. Admin review is required.`}</p></div>}
 {method==='crypto'&&direction==='Withdrawal'&&<label>Withdrawal wallet address<input value={reference} onChange={e=>setReference(e.target.value)} placeholder={`${asset} ${network} destination address`}/></label>}
 {method!=='crypto'&&<label>{direction==='Deposit'?'Transfer/reference ID':'Destination / account / tag'}<input value={reference} onChange={e=>setReference(e.target.value)} placeholder="Reference details"/></label>}
 <button className="solidBtn small" onClick={submit}>{method==='crypto'&&direction==='Deposit'?'Generate deposit request':`Submit ${direction.toLowerCase()} request`}</button>{msg&&<div className="formInfo">{msg}</div>}</div>
 {created&&created.method==='crypto'&&created.direction==='Deposit'&&<div className="cryptoInvoice"><div className="invoiceTop"><div><small>Deposit request</small><h3>{created.asset} · {created.network}</h3></div><Countdown expiresAt={created.expiresAt}/></div><div className="cryptoAddressBox"><small>Send exactly to this address</small><code>{created.depositAddress}</code><button onClick={()=>navigator.clipboard?.writeText(created.depositAddress||'')}>Copy address</button></div><div className="invoiceAmount"><span>Amount</span><b>${created.amount.toLocaleString()}</b></div><label>After payment, enter transaction hash<input value={reference} onChange={e=>setReference(e.target.value)} placeholder="Transaction hash / TXID"/></label><button className="outlineBtn" onClick={async()=>{await fetch('/api/transfers',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({direction:'Deposit',method:'crypto',amount:created.amount,asset:created.asset,network:created.network,reference})});setMsg('TXID submitted. Admin will verify and credit the account.')}}>Submit TXID</button><small className="subtle">This is a manual gateway. Funds are credited only after admin verifies the blockchain transaction.</small></div>}
 </section>
 <section className="panel"><div className="panelHead"><h3>Transfer activity</h3><span>Admin-reviewed requests</span></div><div className="miniLedger">{requests.slice(0,10).map(t=><div key={t.id}><span><b>{t.direction} · {t.method.toUpperCase()}{t.asset?` · ${t.asset}`:''}</b><small>${t.amount.toLocaleString()} · {t.createdAt}</small></span><strong className={t.status.toLowerCase()}>{t.status}</strong></div>)}</div></section></div>
 </section></AppShell>
}