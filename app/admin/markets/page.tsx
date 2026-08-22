"use client"
import {useEffect,useMemo,useState} from "react"
import AdminShell from "@/components/AdminShell"
import AssetLogo from "@/components/AssetLogo"
import type {ShareControl} from "@/lib/ops"
type Ops={shareControls:ShareControl[]}
type Filter="All"|"Stock"|"ETF"|"Enabled"|"Disabled"
const cap=(n:number)=>n>=1e12?`$${(n/1e12).toFixed(2)}T`:n>=1e9?`$${(n/1e9).toFixed(1)}B`:`$${n.toLocaleString('en-US')}`

export default function MarketsAdmin(){
 const [ops,setOps]=useState<any>(null),[saved,setSaved]=useState(""),[query,setQuery]=useState(""),[filter,setFilter]=useState<Filter>("All")
 const [newSymbol,setNewSymbol]=useState(""),[newName,setNewName]=useState(""),[newType,setNewType]=useState<"Stock"|"ETF">("Stock")
 const [newLogoFile,setNewLogoFile]=useState<File|null>(null),[newLogoPreview,setNewLogoPreview]=useState(""),[adding,setAdding]=useState(false),[addMsg,setAddMsg]=useState("")
 const [logoBusy,setLogoBusy]=useState("")
 useEffect(()=>{fetch("/api/admin/operations").then(r=>r.json()).then(setOps)},[])
 useEffect(()=>{
  if(!newLogoFile){setNewLogoPreview("");return}
  const url=URL.createObjectURL(newLogoFile)
  setNewLogoPreview(url)
  return ()=>URL.revokeObjectURL(url)
 },[newLogoFile])

 const save=async(c:ShareControl)=>{
  const r=await fetch("/api/admin/operations",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"share-control",symbol:c.symbol,patch:{manualPrice:c.manualPrice,marketCap:c.marketCap,enabled:c.enabled,approvalRequired:c.approvalRequired,assetType:c.assetType,category:c.category,description:c.description}})})
  if(r.ok){setOps(await r.json());setSaved(c.symbol);setTimeout(()=>setSaved(""),1800)}
 }
 const patch=(symbol:string,fields:Partial<ShareControl>)=>setOps({...ops,shareControls:ops.shareControls.map((x:ShareControl)=>x.symbol===symbol?{...x,...fields}:x)})

 const addAsset=async()=>{
  if(!newSymbol.trim()){setAddMsg("Enter a ticker symbol.");return}
  if(!newLogoFile){setAddMsg("Upload a logo image — it's required to list a new asset.");return}
  setAdding(true);setAddMsg("")
  const fd=new FormData()
  fd.append("symbol",newSymbol);fd.append("name",newName);fd.append("assetType",newType);fd.append("file",newLogoFile)
  const r=await fetch("/api/admin/market-logo",{method:"POST",body:fd})
  const d=await r.json()
  setAdding(false)
  if(!r.ok){setAddMsg(d.error||"Could not add asset.");return}
  setOps({...ops,shareControls:d.shareControls});setNewSymbol("");setNewName("");setNewLogoFile(null)
  setAddMsg("Asset added — disabled until you finish configuring it below.")
 }

 const uploadLogo=async(symbol:string,file:File)=>{
  setLogoBusy(symbol)
  const fd=new FormData()
  fd.append("symbol",symbol);fd.append("file",file)
  const r=await fetch("/api/admin/market-logo",{method:"POST",body:fd})
  const d=await r.json()
  setLogoBusy("")
  if(r.ok)setOps({...ops,shareControls:d.shareControls})
 }

 const filtered=useMemo(()=>{
  let list:ShareControl[]=ops?.shareControls||[]
  if(query.trim()){const q=query.trim().toLowerCase();list=list.filter(x=>x.symbol.toLowerCase().includes(q)||x.name.toLowerCase().includes(q))}
  if(filter==="Stock"||filter==="ETF")list=list.filter(x=>x.assetType===filter)
  if(filter==="Enabled")list=list.filter(x=>x.enabled)
  if(filter==="Disabled")list=list.filter(x=>!x.enabled)
  return list
 },[ops,query,filter])

 return <AdminShell><section className="adminPageV2"><div className="pageHeadV2"><div><span>Markets</span><h1>Shares & market prices</h1><p>Update pricing, classification and descriptions. Save each asset when finished.</p></div></div>

 <section className="adminSectionCardV2 addAssetCardV2">
  <div className="sectionTitleV2"><div><h2>Add a new asset</h2><p>New assets start disabled until you finish configuring them.</p></div></div>
  <div className="contentFormV2">
   <label>Ticker symbol<input value={newSymbol} onChange={e=>setNewSymbol(e.target.value.toUpperCase())} placeholder="e.g. VUG"/></label>
   <label>Name<input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Full company or fund name"/></label>
   <label>Type<select value={newType} onChange={e=>setNewType(e.target.value as any)}><option value="Stock">Stock</option><option value="ETF">ETF</option></select></label>
   <label className="wideV2">Logo (required)<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>setNewLogoFile(e.target.files?.[0]||null)}/></label>
  </div>
  {newLogoPreview&&<div className="newAssetLogoPreviewV2"><img className="assetLogoImg" src={newLogoPreview} width={40} height={40} alt="Logo preview"/><small>Logo preview</small></div>}
  <button className="saveActionV2" onClick={addAsset} disabled={adding}>{adding?"Adding…":"Add asset"}</button>
  {addMsg&&<div className="formInfo">{addMsg}</div>}
 </section>

 <div className="marketAdminFilterBar">
  <input className="marketAdminSearch" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by ticker or name"/>
  <div className="marketFilterTabs">{(["All","Stock","ETF","Enabled","Disabled"] as Filter[]).map(f=><button key={f} className={filter===f?"active":""} onClick={()=>setFilter(f)}>{f}</button>)}</div>
 </div>

 <div className="marketAdminListV2">{filtered.map((c:ShareControl)=><article key={c.symbol}>
   <div className="companyHeadV2"><AssetLogo symbol={c.symbol} logoUrl={c.logoUrl} assetType={c.assetType}/><div><h3>{c.symbol}</h3><p>{c.name}</p></div><b>{c.assetType==="ETF"?(c.category||"ETF"):cap(c.marketCap)}</b></div>
   <div className="companyFieldsV2">
    <label>Share price ($)<input type="number" step=".01" value={c.manualPrice} onChange={e=>patch(c.symbol,{manualPrice:Number(e.target.value)})}/></label>
    <label>Market cap / fund size ($)<input type="number" value={c.marketCap} onChange={e=>patch(c.symbol,{marketCap:Number(e.target.value)})}/></label>
    <label>Asset type<select value={c.assetType} onChange={e=>patch(c.symbol,{assetType:e.target.value as any})}><option value="Stock">Stock</option><option value="ETF">ETF</option></select></label>
    <label>Category (ETF)<input value={c.category||""} onChange={e=>patch(c.symbol,{category:e.target.value})} placeholder="e.g. Broad U.S. equities"/></label>
    <label className="wideV2">Description<textarea value={c.description||""} onChange={e=>patch(c.symbol,{description:e.target.value})}/></label>
    <label className="wideV2">Logo<span className="changeLogoRowV2"><AssetLogo symbol={c.symbol} logoUrl={c.logoUrl} assetType={c.assetType} size={32}/><input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{const f=e.target.files?.[0];if(f)uploadLogo(c.symbol,f);e.target.value=""}}/>{logoBusy===c.symbol&&<small>Uploading…</small>}</span></label>
   </div>
   <div className="companyTogglesV2"><label><input type="checkbox" checked={c.enabled} onChange={e=>patch(c.symbol,{enabled:e.target.checked})}/> Available to clients</label><label><input type="checkbox" checked={c.approvalRequired} onChange={e=>patch(c.symbol,{approvalRequired:e.target.checked})}/> Require approval</label></div>
   <button className="saveActionV2" onClick={()=>save(c)}>{saved===c.symbol?"✓ Saved":"Save changes"}</button>
 </article>)}
 {!filtered.length&&<div className="cleanEmpty"><b>No assets match</b><span>Try a different search or filter.</span></div>}
 </div></section></AdminShell>
}
