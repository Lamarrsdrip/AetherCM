"use client"
import {useEffect,useState} from "react"
import AdminShell from "@/components/AdminShell"
import type {AccountAdjustment,DailyGainRule} from "@/lib/ops"
const money=(n=0)=>n.toLocaleString('en-US',{style:"currency",currency:"USD",minimumFractionDigits:2,maximumFractionDigits:2})
const kindLabel=(kind:string)=>{
 if(kind==="Daily Profit"||kind==="Scheduled daily gain")return "Daily profit"
 if(kind==="Daily Loss")return "Daily loss"
 if(kind==="Account Credit"||kind==="Credit")return "Account credit"
 if(kind==="Account Debit"||kind==="Debit")return "Account debit"
 return kind
}

export default function PerformanceAdmin(){
 const[ops,setOps]=useState<any>(null),[rule,setRule]=useState<DailyGainRule|null>(null),[saved,setSaved]=useState(false)
 useEffect(()=>{fetch("/api/admin/operations").then(r=>r.json()).then(d=>{setOps(d);setRule(d.dailyGain)})},[])
 const save=async()=>{
  if(!rule)return
  const r=await fetch("/api/admin/operations",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"daily-gain",rule})})
  if(r.ok){setOps(await r.json());setSaved(true);setTimeout(()=>setSaved(false),1700)}
 }
 const ledger:AccountAdjustment[]=(ops?.adjustments||[]).slice(0,50)
 if(!ops||!rule)return <AdminShell><section className="adminPageV2">Loading...</section></AdminShell>
 return <AdminShell><section className="adminPageV2">
  <div className="pageHeadV2"><div><span>Performance</span><h1>Daily performance</h1><p>Configure automatic accrual and review the account ledger across all clients.</p></div></div>
  <section className="adminSectionCardV2"><div className="sectionTitleV2"><div><h2>Scheduled daily gain</h2><p>Optional automatic daily accrual applied to eligible accounts.</p></div></div>
   <div className="contentFormV2">
    <label><input type="checkbox" checked={rule.enabled} onChange={e=>setRule({...rule,enabled:e.target.checked})}/> Enabled</label>
    <label>Mode<select value={rule.mode} onChange={e=>setRule({...rule,mode:e.target.value as any})}><option value="percent">Percent of balance</option><option value="fixed">Fixed amount</option></select></label>
    <label>Value<input type="number" step=".01" value={rule.value} onChange={e=>setRule({...rule,value:Number(e.target.value)})}/></label>
    <label>Scope<select value={rule.scope} onChange={e=>setRule({...rule,scope:e.target.value as any})}><option value="managed-only">Managed accounts only</option><option value="all">All accounts</option></select></label>
    <label className="wideV2">Label shown to clients<input value={rule.label} onChange={e=>setRule({...rule,label:e.target.value})}/></label>
   </div>
   <button className="saveActionV2" onClick={save}>{saved?"✓ Saved":"Save rule"}</button>
  </section>
  <section className="adminSectionCardV2"><div className="sectionTitleV2"><div><h2>Account ledger</h2><p>Recent daily profit/loss and cash adjustments across all clients.</p></div></div>
   <div className="performanceLedgerV2">{ledger.length?ledger.map(a=><div key={a.id}><div><b>{a.userName}</b><small>{kindLabel(a.kind)} · {a.note}</small></div><div className="right"><b className={a.amount>=0?"gain":"loss"}>{a.amount>=0?"+":""}{money(a.amount)}</b><small>{new Date(a.createdAt).toLocaleString('en-US')}</small></div></div>):<p className="subtle">No ledger entries yet.</p>}</div>
  </section>
 </section></AdminShell>
}
