'use client'
import {useEffect,useMemo,useState} from 'react'
import AppShell from '@/components/AppShell'
import type {ShareAllocation,ShareControl} from '@/lib/ops'

export default function Portfolio(){
 const [controls,setControls]=useState<ShareControl[]>([]),[requests,setRequests]=useState<ShareAllocation[]>([])
 const [symbol,setSymbol]=useState('TSLA'),[amount,setAmount]=useState('1000'),[msg,setMsg]=useState('')
 const load=()=>fetch('/api/allocations').then(r=>r.json()).then(d=>{setControls(d.shareControls);setRequests(d.requests.filter((x:ShareAllocation)=>x.userId==='AC-20491'))})
 useEffect(()=>{load()},[])
 const ctl=useMemo(()=>controls.find(c=>c.symbol===symbol)||controls[0],[controls,symbol])
 const dollars=Number(amount||0),shares=ctl?.manualPrice?dollars/ctl.manualPrice:0
 const submit=async()=>{setMsg('');const r=await fetch('/api/allocations',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({symbol:ctl?.symbol,amount:dollars})});const d=await r.json();if(!r.ok){setMsg(d.error||'Could not submit');return}setRequests([d.item,...requests]);setMsg(d.item.status==='Pending'?'Request submitted for admin approval.':'Allocation approved.')}
 return <AppShell><section className="workspace"><div className="workspaceHead"><div><span className="eyebrow">Portfolio</span><h1>Build your allocation.</h1><p>Enter the amount you want to allocate. Share quantity is calculated from the current platform quote.</p></div></div>
 <div className="allocationClientGrid"><section className="panel"><div className="panelHead"><h3>Acquire shares</h3><span>{ctl?.approvalRequired?'Admin approval required':'Instant allocation'}</span></div><div className="compactForm"><select value={ctl?.symbol||''} onChange={e=>setSymbol(e.target.value)}>{controls.filter(c=>c.enabled).map(c=><option key={c.symbol} value={c.symbol}>{c.symbol} · {c.name}</option>)}</select><label>Amount to allocate<input type="number" min={ctl?.minAmount||1} value={amount} onChange={e=>setAmount(e.target.value)} placeholder="1000"/></label><div className="allocationQuote"><small>Platform quote</small><b>${ctl?.manualPrice?.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})||'—'} / share</b><span>Indicative/admin-managed quote</span></div><div className="allocationQuote"><small>Estimated shares</small><b>{shares.toLocaleString(undefined,{maximumFractionDigits:6})}</b><span>${dollars.toLocaleString()} requested · max {ctl?.maxShares||0} shares</span></div><button className="solidBtn small" onClick={submit}>Request allocation</button>{msg&&<div className="formInfo">{msg}</div>}</div></section>
 <section className="panel"><div className="panelHead"><h3>Your requests</h3><span>Recent allocation decisions</span></div><div className="miniLedger">{requests.slice(0,8).map(r=><div key={r.id}><span><b>{r.symbol} · ${r.requestedAmount.toLocaleString()}</b><small>{r.shares.toLocaleString(undefined,{maximumFractionDigits:6})} shares @ ${r.price.toLocaleString()} · {r.createdAt}</small></span><strong className={r.status.toLowerCase()}>{r.status}</strong></div>)}</div></section></div>
 <div className="complianceNote">Platform quotes shown here are administrator-managed prototype quotes, not a claim of live exchange execution. Production brokerage pricing should come from an authorized market-data/execution provider.</div>
 </section></AppShell>
}