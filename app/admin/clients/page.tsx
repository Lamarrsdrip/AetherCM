"use client"
import{useEffect,useMemo,useState}from"react";import AdminShell from"@/components/AdminShell";import type{Account,AccountAdjustment}from"@/lib/ops"
const money=(n=0)=>n.toLocaleString('en-US',{style:"currency",currency:"USD",minimumFractionDigits:2,maximumFractionDigits:2})
const kindLabel=(kind:string)=>{
 if(kind==="Daily Profit"||kind==="Scheduled daily gain")return "Daily profit"
 if(kind==="Daily Loss")return "Daily loss"
 if(kind==="Account Credit"||kind==="Credit")return "Account credit"
 if(kind==="Account Debit"||kind==="Debit")return "Account debit"
 return kind
}
export default function ClientsAdmin(){
 const[ops,setOps]=useState<any>(null),[amount,setAmount]=useState(""),[note,setNote]=useState(""),[client,setClient]=useState("")
 const[kind,setKind]=useState<"Daily Profit"|"Daily Loss"|"Account Credit"|"Account Debit">("Daily Profit"),[msg,setMsg]=useState("")
 useEffect(()=>{fetch("/api/admin/operations").then(r=>r.json()).then(setOps)},[])
 const selected=ops?.accounts?.find((a:Account)=>a.id===client)
 const history=useMemo(()=>(ops?.adjustments||[]).filter((a:AccountAdjustment)=>a.userId===client).slice(0,10),[ops,client])
 const save=async()=>{
  setMsg("")
  if(!selected)return
  const r=await fetch("/api/admin/operations",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"adjust-balance",userId:selected.id,userName:selected.name,kind,amount:Number(amount),note})})
  const d=await r.json()
  if(r.ok){setOps(d);setAmount("");setNote("");setMsg("Applied.")}
  else setMsg(d.error||"Could not apply this change.")
 }
 return <AdminShell><section className="adminPageV2"><div className="pageHeadV2"><div><span>Clients</span><h1>Client accounts</h1><p>Real created accounts only. New accounts begin at $0.</p></div></div><section className="adminSectionCardV2"><div className="clientListV2">{ops?.accounts?.map((a:Account)=><button key={a.id} onClick={()=>setClient(a.id)} className={client===a.id?"selected":""}><span>{a.name.slice(0,2).toUpperCase()}</span><div><b>{a.name}</b><small>{a.email}</small></div><strong>{a.status}</strong></button>)}</div></section>
 {selected&&<section className="adminSectionCardV2"><div className="sectionTitleV2"><div><h2>Adjust {selected.name}'s balance</h2><p>This creates a real, stored account ledger entry.</p></div></div>
  <div className="contentFormV2">
   <label>Action<select value={kind} onChange={e=>setKind(e.target.value as any)}><option value="Daily Profit">Daily Profit</option><option value="Daily Loss">Daily Loss</option><option value="Account Credit">Account Credit</option><option value="Account Debit">Account Debit</option></select></label>
   <label>Amount<input type="number" min="0" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="500"/></label>
   <label className="wideV2">Reason / reference<input value={note} onChange={e=>setNote(e.target.value)} placeholder="Reason / reference"/></label>
  </div>
  <button className="saveActionV2" onClick={save}>Apply</button>
  {msg&&<div className="formInfo">{msg}</div>}
  <div className="clientHistoryV2"><h3>Recent ledger entries</h3>{history.length?history.map((a:AccountAdjustment)=><div key={a.id}><b>{kindLabel(a.kind)}</b><span className={a.amount>=0?"gain":"loss"}>{a.amount>=0?"+":""}{money(a.amount)}</span><small>{a.note}</small><small>{new Date(a.createdAt).toLocaleString('en-US')}</small></div>):<p className="subtle">No ledger entries yet.</p>}</div>
 </section>}
 </section></AdminShell>}
