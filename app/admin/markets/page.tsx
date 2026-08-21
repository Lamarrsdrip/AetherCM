"use client"
import {useEffect,useState} from "react"
import AdminShell from "@/components/AdminShell"
import type {ShareControl} from "@/lib/ops"
type Ops={shareControls:ShareControl[]}
const cap=(n:number)=>n>=1e12?`$${(n/1e12).toFixed(2)}T`:n>=1e9?`$${(n/1e9).toFixed(1)}B`:`$${n.toLocaleString()}`
export default function MarketsAdmin(){
 const [ops,setOps]=useState<any>(null),[saved,setSaved]=useState("")
 useEffect(()=>{fetch("/api/admin/operations").then(r=>r.json()).then(setOps)},[])
 const save=async(c:ShareControl)=>{const r=await fetch("/api/admin/operations",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"share-control",symbol:c.symbol,patch:{manualPrice:c.manualPrice,marketCap:c.marketCap,enabled:c.enabled,approvalRequired:c.approvalRequired}})});if(r.ok){setOps(await r.json());setSaved(c.symbol);setTimeout(()=>setSaved(""),1800)}}
 return <AdminShell><section className="adminPageV2"><div className="pageHeadV2"><div><span>Markets</span><h1>Shares & market prices</h1><p>Update the price and market capitalization clients see. Save each company when finished.</p></div></div>
 <div className="marketAdminListV2">{ops?.shareControls?.map((c:ShareControl)=><article key={c.symbol}>
   <div className="companyHeadV2"><span>{c.symbol.slice(0,2)}</span><div><h3>{c.symbol}</h3><p>{c.name}</p></div><b>{cap(c.marketCap)}</b></div>
   <div className="companyFieldsV2"><label>Share price ($)<input type="number" step=".01" value={c.manualPrice} onChange={e=>setOps({...ops,shareControls:ops.shareControls.map((x:ShareControl)=>x.symbol===c.symbol?{...x,manualPrice:Number(e.target.value)}:x)})}/></label><label>Market capitalization ($)<input type="number" value={c.marketCap} onChange={e=>setOps({...ops,shareControls:ops.shareControls.map((x:ShareControl)=>x.symbol===c.symbol?{...x,marketCap:Number(e.target.value)}:x)})}/></label></div>
   <div className="companyTogglesV2"><label><input type="checkbox" checked={c.enabled} onChange={e=>setOps({...ops,shareControls:ops.shareControls.map((x:ShareControl)=>x.symbol===c.symbol?{...x,enabled:e.target.checked}:x)})}/> Available to clients</label><label><input type="checkbox" checked={c.approvalRequired} onChange={e=>setOps({...ops,shareControls:ops.shareControls.map((x:ShareControl)=>x.symbol===c.symbol?{...x,approvalRequired:e.target.checked}:x)})}/> Require approval</label></div>
   <button className="saveActionV2" onClick={()=>save(c)}>{saved===c.symbol?"✓ Saved":"Save changes"}</button>
 </article>)}</div></section></AdminShell>
}
