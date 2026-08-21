"use client"
import {useEffect,useState} from "react"
import AdminShell from "@/components/AdminShell"
import type {TransferRequest} from "@/lib/ops"
export default function FundingAdmin(){
 const[ops,setOps]=useState<any>(null),[saved,setSaved]=useState("")
 useEffect(()=>{fetch("/api/admin/operations").then(r=>r.json()).then(setOps)},[])
 const op=async(body:any)=>{const r=await fetch("/api/admin/operations",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});if(r.ok)setOps(await r.json())}
 const saveAddress=async(a:any)=>{await op({action:"crypto-address",id:a.id,patch:{address:a.address,enabled:a.enabled,minDeposit:a.minDeposit}});setSaved(a.id);setTimeout(()=>setSaved(""),1700)}
 return <AdminShell><section className="adminPageV2"><div className="pageHeadV2"><div><span>Money movement</span><h1>Funding & withdrawals</h1><p>Configure client payment methods and review transfer requests.</p></div></div>
  <section className="adminSectionCardV2"><div className="sectionTitleV2"><div><h2>Crypto deposit addresses</h2><p>Each address has its own clear Save button.</p></div><label className="masterToggleV2"><input type="checkbox" checked={!!ops?.cryptoGateway?.enabled} onChange={e=>op({action:"crypto-gateway",patch:{enabled:e.target.checked}})}/> Crypto gateway enabled</label></div>
   <div className="cryptoAdminGridV2">{ops?.cryptoGateway?.addresses?.map((a:any)=><article key={a.id}><div className="cryptoHeadV2"><div><b>{a.asset}</b><span>{a.network}</span></div><label><input type="checkbox" checked={a.enabled} onChange={e=>setOps({...ops,cryptoGateway:{...ops.cryptoGateway,addresses:ops.cryptoGateway.addresses.map((x:any)=>x.id===a.id?{...x,enabled:e.target.checked}:x)}})}/> Enabled</label></div><label>Deposit address<input value={a.address} onChange={e=>setOps({...ops,cryptoGateway:{...ops.cryptoGateway,addresses:ops.cryptoGateway.addresses.map((x:any)=>x.id===a.id?{...x,address:e.target.value}:x)}})}/></label><label>Minimum deposit ($)<input type="number" value={a.minDeposit} onChange={e=>setOps({...ops,cryptoGateway:{...ops.cryptoGateway,addresses:ops.cryptoGateway.addresses.map((x:any)=>x.id===a.id?{...x,minDeposit:Number(e.target.value)}:x)}})}/></label><button className="saveActionV2" onClick={()=>saveAddress(a)}>{saved===a.id?"✓ Address saved":"Save address"}</button></article>)}</div>
  </section>
  <section className="adminSectionCardV2"><div className="sectionTitleV2"><div><h2>Pending transfers</h2><p>Approve only after the payment has been verified.</p></div></div><div className="requestCardsV2">{ops?.transfers?.map((t:TransferRequest)=><article key={t.id}><div><b>{t.userName}</b><small>{t.direction} · {t.method.toUpperCase()}</small></div><strong>${t.amount.toLocaleString()}</strong><span className={t.status.toLowerCase()}>{t.status}</span>{t.status==="Pending"&&<div><button onClick={()=>op({action:"transfer-status",id:t.id,status:"Completed"})}>Complete</button><button className="dangerV2" onClick={()=>op({action:"transfer-status",id:t.id,status:"Rejected"})}>Reject</button></div>}</article>)}</div></section>
 </section></AdminShell>
}
