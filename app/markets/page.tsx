"use client"
import{useEffect,useState}from"react"
import AppShell from"@/components/AppShell"
import type{ShareControl}from"@/lib/ops"
const money=(n=0)=>n.toLocaleString(undefined,{style:"currency",currency:"USD",maximumFractionDigits:2})
const cap=(n=0)=>!n?"—":n>=1e12?`$${(n/1e12).toFixed(2)}T`:n>=1e9?`$${(n/1e9).toFixed(1)}B`:money(n)
export default function Markets(){
 const[s,setS]=useState<ShareControl[]>([])
 useEffect(()=>{fetch("/api/allocations").then(r=>r.json()).then(d=>setS(d.shareControls||[]))},[])
 return <AppShell><section className="workspace modernWorkspace"><div className="workspaceHead"><div><span className="eyebrow">Markets</span><h1>Explore investments.</h1><p>Review the shares and ETFs currently available through Aether.</p></div></div><div className="marketCompanyGrid">{s.filter(x=>x.enabled).map(x=>{const move=x.previousPrice?(x.manualPrice-x.previousPrice)/x.previousPrice*100:0;return <article key={x.symbol}><div className="marketCompanyTop"><span>{x.symbol.slice(0,2)}</span><div><b>{x.symbol}</b><small>{x.name}</small></div></div><h3>{money(x.manualPrice)}</h3><div className={move>=0?"gain":"loss"}>{move>=0?"+":""}{move.toFixed(2)}% since the previous price</div><div className="marketCapLine"><small>{x.name.includes("ETF")||["SPY","QQQ","VTI","VOO","IWM","SCHD","VXUS","DIA","DFAI"].includes(x.symbol)?"Fund size":"Market capitalization"}</small><b>{cap(x.marketCap)}</b></div><a href="/portfolio">View investment →</a></article>})}</div></section></AppShell>
}
