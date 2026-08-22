"use client"
import{useEffect,useMemo,useState}from"react"
import Link from"next/link"
import AppShell from"@/components/AppShell"
import AssetLogo from"@/components/AssetLogo"
import type{ShareControl}from"@/lib/ops"
const money=(n=0)=>n.toLocaleString('en-US',{style:"currency",currency:"USD",maximumFractionDigits:2})
const cap=(n=0)=>!n?"—":n>=1e12?`$${(n/1e12).toFixed(2)}T`:n>=1e9?`$${(n/1e9).toFixed(1)}B`:money(n)
type Filter="All"|"Stock"|"ETF"

export default function Markets(){
 const[s,setS]=useState<ShareControl[]>([]),[filter,setFilter]=useState<Filter>("All")
 useEffect(()=>{fetch("/api/allocations").then(r=>r.json()).then(d=>setS(d.shareControls||[]))},[])
 const enabled=useMemo(()=>s.filter(x=>x.enabled),[s])
 const visible=useMemo(()=>filter==="All"?enabled:enabled.filter(x=>x.assetType===filter),[enabled,filter])
 return <AppShell><section className="workspace modernWorkspace">
  <div className="workspaceHead"><div><span className="eyebrow">Markets</span><h1>Explore investments.</h1><p>Review the shares and ETFs currently available through Aether.</p></div></div>
  <div className="marketFilterTabs">{(["All","Stock","ETF"] as Filter[]).map(f=><button key={f} className={filter===f?"active":""} onClick={()=>setFilter(f)}>{f==="All"?"All assets":f==="Stock"?"Stocks":"ETFs"}</button>)}</div>
  <div className="marketCompanyGrid">{visible.map(x=>{
   const move=x.previousPrice?(x.manualPrice-x.previousPrice)/x.previousPrice*100:0
   return <Link className="marketAssetCard" href={`/markets/${x.symbol}`} key={x.symbol}>
    <div className="marketCompanyTop">
     <AssetLogo symbol={x.symbol} logoUrl={x.logoUrl} assetType={x.assetType}/>
     <div><b>{x.symbol}</b><small>{x.name}</small></div>
     <span className="assetTypeBadge">{x.assetType}</span>
    </div>
    <h3>{money(x.manualPrice)}</h3>
    <div className={move>=0?"gain":"loss"}>{move>=0?"+":""}{move.toFixed(2)}% today</div>
    <p className="marketAssetDescription">{x.description}</p>
    <div className="marketCapLine"><small>{x.assetType==="ETF"?"Category":"Market capitalization"}</small><b>{x.assetType==="ETF"?(x.category||"—"):cap(x.marketCap)}</b></div>
    <span className="viewInvestmentLink">View investment →</span>
   </Link>
  })}</div>
  {!visible.length&&<div className="cleanEmpty"><b>No assets available</b><span>Check back soon for new investments.</span></div>}
 </section></AppShell>
}
