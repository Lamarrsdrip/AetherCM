"use client"
import {useEffect,useState} from "react"
import AdminShell from "@/components/AdminShell"
import type {TransferRequest} from "@/lib/ops"

export default function FundingAdmin(){
 const[ops,setOps]=useState<any>(null),[saved,setSaved]=useState("")
 useEffect(()=>{fetch("/api/admin/operations",{cache:"no-store"}).then(r=>r.json()).then(setOps)},[])
 const op=async(body:any)=>{const r=await fetch("/api/admin/operations",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});if(r.ok)setOps(await r.json())}
 const method=(id:string)=>ops?.fundingMethods?.find((m:any)=>m.id===id)
 const editMethod=(id:string,patch:any)=>setOps({...ops,fundingMethods:ops.fundingMethods.map((m:any)=>m.id===id?{...m,...patch}:m)})
 const saveMethod=async(id:string)=>{const m=method(id);await op({action:"funding-method",id,patch:m});setSaved(id);setTimeout(()=>setSaved(""),1800)}
 const saveAddress=async(a:any)=>{await op({action:"crypto-address",id:a.id,patch:{address:a.address,enabled:a.enabled,minDeposit:a.minDeposit}});setSaved(a.id);setTimeout(()=>setSaved(""),1800)}
 const paypal=method("paypal"),wire=method("wire")
 return <AdminShell><section className="adminPageV2">
  <div className="pageHeadV2"><div><span>Money movement</span><h1>Funding & withdrawals</h1><p>Set exactly what clients see for crypto, PayPal and international bank transfers.</p></div></div>

  <div className="fundingTabsIntro"><span>Three funding methods</span><b>Configure each method separately, then save it.</b></div>

  <section className="adminSectionCardV2 fundingMethodSection">
   <div className="sectionTitleV2"><div><h2>Crypto deposits</h2><p>Manual wallet gateway with address-by-network control.</p></div><label className="masterToggleV2"><input type="checkbox" checked={!!ops?.cryptoGateway?.enabled} onChange={e=>op({action:"crypto-gateway",patch:{enabled:e.target.checked}})}/> Enabled</label></div>
   <div className="cryptoAdminGridV2">{ops?.cryptoGateway?.addresses?.map((a:any)=><article key={a.id}><div className="cryptoHeadV2"><div><b>{a.asset}</b><span>{a.network}</span></div><label><input type="checkbox" checked={a.enabled} onChange={e=>setOps({...ops,cryptoGateway:{...ops.cryptoGateway,addresses:ops.cryptoGateway.addresses.map((x:any)=>x.id===a.id?{...x,enabled:e.target.checked}:x)}})}/> Enabled</label></div><label>Deposit address<input value={a.address} onChange={e=>setOps({...ops,cryptoGateway:{...ops.cryptoGateway,addresses:ops.cryptoGateway.addresses.map((x:any)=>x.id===a.id?{...x,address:e.target.value}:x)}})}/></label><label>Minimum deposit ($)<input type="number" value={a.minDeposit} onChange={e=>setOps({...ops,cryptoGateway:{...ops.cryptoGateway,addresses:ops.cryptoGateway.addresses.map((x:any)=>x.id===a.id?{...x,minDeposit:Number(e.target.value)}:x)}})}/></label><button className="saveActionV2" onClick={()=>saveAddress(a)}>{saved===a.id?"✓ Address saved":"Save address"}</button></article>)}</div>
  </section>

  <section className="adminSectionCardV2 fundingMethodSection">
   <div className="sectionTitleV2"><div><h2>PayPal</h2><p>Set the PayPal tag, payment link and instructions clients should follow.</p></div><label className="masterToggleV2"><input type="checkbox" checked={!!paypal?.enabled} onChange={e=>editMethod("paypal",{enabled:e.target.checked})}/> Enabled</label></div>
   <div className="fundingConfigGrid">
    <label>PayPal tag / username<input value={paypal?.paypalTag||""} onChange={e=>editMethod("paypal",{paypalTag:e.target.value})} placeholder="@AetherCapital"/></label>
    <label>PayPal payment link<input value={paypal?.paymentLink||""} onChange={e=>editMethod("paypal",{paymentLink:e.target.value})} placeholder="https://paypal.me/..."/></label>
    <label className="wideV2">Client instructions<textarea value={paypal?.instructions||""} onChange={e=>editMethod("paypal",{instructions:e.target.value})} placeholder="Example: Send as Goods & Services, then enter your PayPal transaction ID below."/></label>
   </div>
   <button className="saveActionV2" onClick={()=>saveMethod("paypal")}>{saved==="paypal"?"✓ PayPal saved":"Save PayPal settings"}</button>
  </section>

  <section className="adminSectionCardV2 fundingMethodSection">
   <div className="sectionTitleV2"><div><h2>International bank transfer</h2><p>Set bank details and the exact wire instructions clients will receive.</p></div><label className="masterToggleV2"><input type="checkbox" checked={!!wire?.enabled} onChange={e=>editMethod("wire",{enabled:e.target.checked})}/> Enabled</label></div>
   <div className="fundingConfigGrid">
    <label>Bank name<input value={wire?.bankName||""} onChange={e=>editMethod("wire",{bankName:e.target.value})} placeholder="Bank name"/></label>
    <label>Beneficiary name<input value={wire?.beneficiary||""} onChange={e=>editMethod("wire",{beneficiary:e.target.value})} placeholder="Aether Capital Markets"/></label>
    <label>Account / IBAN<input value={wire?.accountNumber||""} onChange={e=>editMethod("wire",{accountNumber:e.target.value})} placeholder="Account number or IBAN"/></label>
    <label>SWIFT / BIC<input value={wire?.swift||""} onChange={e=>editMethod("wire",{swift:e.target.value})} placeholder="SWIFT / BIC"/></label>
    <label>Routing / sort code<input value={wire?.routing||""} onChange={e=>editMethod("wire",{routing:e.target.value})} placeholder="Optional"/></label>
    <label>Bank address<input value={wire?.bankAddress||""} onChange={e=>editMethod("wire",{bankAddress:e.target.value})} placeholder="Optional bank address"/></label>
    <label className="wideV2">Client instructions<textarea value={wire?.instructions||""} onChange={e=>editMethod("wire",{instructions:e.target.value})} placeholder="Example: Use your Aether account ID as payment reference and upload the transfer reference after sending."/></label>
   </div>
   <button className="saveActionV2" onClick={()=>saveMethod("wire")}>{saved==="wire"?"✓ Bank settings saved":"Save bank transfer settings"}</button>
  </section>

  <section className="adminSectionCardV2"><div className="sectionTitleV2"><div><h2>Pending transfers</h2><p>Review deposits and withdrawals from all enabled methods.</p></div></div><div className="requestCardsV2">{ops?.transfers?.map((t:TransferRequest)=><article key={t.id}><div><b>{t.userName}</b><small>{t.direction} · {t.method.toUpperCase()}</small></div><strong>${t.amount.toLocaleString()}</strong><span className={t.status.toLowerCase()}>{t.status}</span>{t.status==="Pending"&&<div><button onClick={()=>op({action:"transfer-status",id:t.id,status:"Completed"})}>Complete</button><button className="dangerV2" onClick={()=>op({action:"transfer-status",id:t.id,status:"Rejected"})}>Reject</button></div>}</article>)}</div></section>
 </section></AdminShell>
}
