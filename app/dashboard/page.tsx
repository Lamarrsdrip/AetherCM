'use client'
import {useEffect,useState} from 'react'
import AppShell from '@/components/AppShell'
import type {AccountAdjustment,ShareAllocation,TransferRequest} from '@/lib/ops'

type Snap={balance:number;invested:number;available:number;daily:AccountAdjustment[];approved:ShareAllocation[];allocations:ShareAllocation[];transfers:TransferRequest[]}
export default function Dashboard(){
 const [s,setS]=useState<Snap|null>(null);useEffect(()=>{fetch('/api/account').then(r=>r.json()).then(setS)},[])
 const latestGain=s?.daily?.[0]?.amount||0
 return <AppShell><section className="workspace"><div className="workspaceHead"><div><span className="eyebrow">Overview</span><h1>Your Aether account.</h1><p>Balance, allocations, daily accruals and transfer activity in one view.</p></div></div>
 <div className="balancePanel"><div><small>Overall balance</small><h2>${(s?.balance||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</h2><span className={latestGain>=0?'good':'bad'}>{latestGain>=0?'+':''}${latestGain.toLocaleString()} latest daily accrual</span></div><div className="balanceMeta"><div><small>Available</small><b>${(s?.available||0).toLocaleString()}</b></div><div><small>Approved allocations</small><b>${(s?.invested||0).toLocaleString()}</b></div><div><small>Pending requests</small><b>{s?.allocations?.filter(a=>a.status==='Pending').length||0}</b></div></div></div>
 <div className="dashGrid"><div className="panel"><div className="panelHead"><h3>Approved shares</h3><a href="/portfolio">Allocate</a></div><div className="positionList">{(s?.approved||[]).slice(0,5).map(p=><div key={p.id}><span className="assetBadge">{p.symbol[0]}</span><div className="grow"><b>{p.symbol}</b><small>{p.shares.toLocaleString(undefined,{maximumFractionDigits:6})} shares @ ${p.price.toLocaleString()}</small></div><div className="right"><b>${p.value.toLocaleString()}</b><small>{p.status}</small></div></div>)}{!s?.approved?.length&&<p className="subtle">No approved share allocations yet.</p>}</div></div>
 <div className="panel"><div className="panelHead"><h3>Daily gains</h3><span>Scheduled ledger</span></div><div className="activityList">{(s?.daily||[]).slice(0,7).map(a=><div key={a.id}><div><b>{a.kind}</b><small>{a.createdAt}</small></div><div className="right"><b className={a.amount>=0?'good':'bad'}>{a.amount>=0?'+':''}${a.amount.toLocaleString()}</b><small>{a.note}</small></div></div>)}{!s?.daily?.length&&<p className="subtle">No daily accrual has been posted.</p>}</div></div></div>
 <div className="panel calloutPanel"><div><span className="eyebrow">Funding</span><h3>Crypto-first account funding.</h3><p>Use the funding center for crypto, international wire or PayPal instructions configured by your administrator.</p></div><a className="outlineBtn" href="/transfers">Move money</a></div>
 </section></AppShell>
}