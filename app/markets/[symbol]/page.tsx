"use client"
import {useEffect,useMemo,useState} from "react"
import {useParams} from "next/navigation"
import Link from "next/link"
import AppShell from "@/components/AppShell"
import AssetLogo from "@/components/AssetLogo"
import type {ShareControl} from "@/lib/ops"
const money=(n=0)=>n.toLocaleString('en-US',{style:"currency",currency:"USD",minimumFractionDigits:2,maximumFractionDigits:2})
const cap=(n=0)=>!n?"—":n>=1e12?`$${(n/1e12).toFixed(2)}T`:n>=1e9?`$${(n/1e9).toFixed(1)}B`:money(n)

export default function StockDetail(){
 const params=useParams<{symbol:string}>()
 const symbol=String(params?.symbol||"").toUpperCase()
 const[controls,setControls]=useState<ShareControl[]>([]),[available,setAvailable]=useState(0)
 const[amount,setAmount]=useState(""),[msg,setMsg]=useState(""),[busy,setBusy]=useState(false)
 useEffect(()=>{fetch("/api/allocations",{cache:"no-store"}).then(r=>r.json()).then(d=>{setControls(d.shareControls||[]);setAvailable(d.available||0)})},[])
 const ctl=useMemo(()=>controls.find(c=>c.symbol===symbol),[controls,symbol])
 const dollars=Number(amount||0)
 const shares=ctl?.manualPrice?dollars/ctl.manualPrice:0
 const move=ctl?.previousPrice?((ctl.manualPrice-ctl.previousPrice)/ctl.previousPrice*100):0

 async function submit(){
  if(!ctl)return
  setMsg("");setBusy(true)
  const r=await fetch("/api/allocations",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({symbol:ctl.symbol,amount:dollars})})
  const d=await r.json()
  setBusy(false)
  if(!r.ok)return setMsg(d.error||"We could not send this request.")
  setAvailable(d.available??available-dollars)
  setAmount("")
  setMsg(d.item.status==="Pending"?"Request received. We’ll let you know when it is reviewed.":"Your investment is active.")
 }

 if(controls.length && !ctl){
  return <AppShell><section className="workspace modernWorkspace"><div className="cleanEmpty"><b>Asset not found</b><span>This investment is not currently available.</span></div><Link className="secondaryActionBtn" href="/markets">← Back to markets</Link></section></AppShell>
 }

 return <AppShell><section className="workspace modernWorkspace stockDetailPage">
  <Link className="backToMarketsLink" href="/markets">← Back to markets</Link>
  <div className="stockDetailHead">
   <AssetLogo symbol={symbol} logoUrl={ctl?.logoUrl} assetType={ctl?.assetType||"Stock"} size={56}/>
   <div><h1>{ctl?.symbol||symbol}</h1><p>{ctl?.name||"Loading…"}</p></div>
   <span className="assetTypeBadge">{ctl?.assetType||""}</span>
  </div>
  <div className="stockDetailGrid">
   <section className="panel stockDetailInfo">
    <div className="quoteHeadline"><div><small>Current price</small><b>{money(ctl?.manualPrice||0)}</b></div><span className={move>=0?"gain":"loss"}>{move>=0?"+":""}{move.toFixed(2)}% today</span></div>
    <div className="stockDetailStats">
     <div><small>{ctl?.assetType==="ETF"?"Category":"Market capitalization"}</small><b>{ctl?.assetType==="ETF"?(ctl?.category||"—"):cap(ctl?.marketCap)}</b></div>
     <div><small>Minimum investment</small><b>{money(ctl?.minAmount||0)}</b></div>
    </div>
    <p className="stockDetailDescription">{ctl?.description}</p>
   </section>
   <section className="panel investComposer">
    <div className="composerHeader"><span className="eyebrow">Invest</span><h3>Request an allocation</h3><p>Your share quantity is calculated from the current Aether price.</p></div>
    <label className="moneyInputLabel">Amount to invest<div className="moneyInput"><span>$</span><input type="number" min={ctl?.minAmount||1} value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00"/></div></label>
    <div className="tradePreview"><div><small>Estimated shares</small><b>{shares.toLocaleString('en-US',{maximumFractionDigits:6})}</b></div><div><small>Available cash</small><b>{money(available)}</b></div></div>
    <button className="primaryMoneyBtn fullWidth" disabled={!dollars||busy} onClick={submit}>{busy?"Submitting…":"Request allocation"}</button>
    {msg&&<div className="formInfo">{msg}</div>}
    <small className="tradeFinePrint">{ctl?.approvalRequired?"This investment is reviewed before it becomes active.":"This investment can become active immediately."}</small>
   </section>
  </div>
 </section></AppShell>
}
