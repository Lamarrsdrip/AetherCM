"use client"
import {useEffect,useState} from "react"
import AppShell from "@/components/AppShell"
import AssetLogo from "@/components/AssetLogo"
import type {AccountAdjustment,HoldingView,ShareAllocation,TransferRequest} from "@/lib/ops"

type PerfEntry={id:string;userId:string;date:string;amount:number;pct:number;createdAt:string}
type Snap={
 balance:number;available:number;invested:number;investedCost:number;unrealizedPnl:number;dayPnl:number;
 todayPnl:number;todayPnlPct:number;performanceHistory:PerfEntry[];
 holdings:HoldingView[];adjustments:AccountAdjustment[];allocations:ShareAllocation[];transfers:TransferRequest[];
 account:{id:string;email:string;name:string}
}
const money=(n=0)=>n.toLocaleString('en-US',{style:"currency",currency:"USD",minimumFractionDigits:2,maximumFractionDigits:2})
const pct=(n=0)=>`${n>=0?"+":""}${n.toFixed(2)}%`
const adjustmentLabel=(kind:string)=>{
 if(kind==="Daily Profit"||kind==="Scheduled daily gain")return "Daily profit"
 if(kind==="Daily Loss")return "Daily loss"
 if(kind==="Account Credit"||kind==="Credit")return "Account credit"
 if(kind==="Account Debit"||kind==="Debit")return "Account debit"
 return kind
}
const dayLabel=(date:string)=>{
 const today=new Date().toISOString().slice(0,10)
 const y=new Date(Date.now()-86400000).toISOString().slice(0,10)
 if(date===today)return "Today"
 if(date===y)return "Yesterday"
 return new Date(date+"T00:00:00").toLocaleDateString('en-US',{month:"short",day:"numeric"})
}
const purchaseDate=(iso:string)=>new Date(iso).toLocaleDateString('en-US',{month:"short",day:"numeric",year:"numeric"})

export default function Dashboard(){
 const [s,setS]=useState<Snap|null>(null)
 useEffect(()=>{fetch("/api/account",{cache:"no-store"}).then(r=>r.json()).then(setS)},[])
 const pending=s?.allocations?.filter(a=>a.status==="Pending").length||0
 const totalReturn=s?.investedCost?((s.invested-s.investedCost)/s.investedCost*100):0
 const purchases=(s?.allocations||[]).filter(a=>a.status==="Approved")
 const activity=[
  ...(s?.transfers||[]).map(t=>({key:`t-${t.id}`,createdAt:t.createdAt,title:`${t.direction} · ${t.method.toUpperCase()}`,amount:t.amount,tone:t.amount>=0?"gain":"loss",status:t.status,statusClass:t.status.toLowerCase()})),
  ...(s?.adjustments||[]).map(a=>({key:`a-${a.id}`,createdAt:a.createdAt,title:adjustmentLabel(a.kind),amount:a.amount,tone:a.amount>=0?"gain":"loss",status:a.note,statusClass:""})),
  ...purchases.map(p=>({key:`p-${p.id}`,createdAt:p.purchasedAt||p.createdAt,title:`Bought ${p.symbol}`,amount:p.requestedAmount,tone:"neutral",status:`${p.shares.toLocaleString('en-US',{maximumFractionDigits:6})} shares · ${money(p.price)}/share · Completed`,statusClass:"approved"}))
 ].sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,6)
 return <AppShell><section className="workspace modernWorkspace">
  <div className="workspaceHead appPageHead"><div><span className="eyebrow">Overview</span><h1>{s?.account?.name?`Welcome, ${s.account.name.split(" ")[0]}.`:"Your account."}</h1><p>A clear view of cash, invested assets and market performance.</p></div><div className="headActions"><a className="primaryMoneyBtn" href="/transfers">＋ Add money</a><a className="secondaryActionBtn" href="/portfolio">Invest</a></div></div>
  <section className="heroBalanceCard"><div className="heroBalanceMain"><small>Total account value</small><h2>{money(s?.balance||0)}</h2><div className="marketLine"><span className={(s?.todayPnl||0)>=0?"gain":"loss"}>{(s?.todayPnl||0)>=0?"+":""}{money(s?.todayPnl||0)} · {pct(s?.todayPnlPct||0)} today</span><span>Market-linked holdings and account activity update this figure</span></div></div><div className="heroBalanceStats"><div><small>Available cash</small><b>{money(s?.available||0)}</b></div><div><small>Invested</small><b>{money(s?.invested||0)}</b></div><div><small>Total return</small><b className={(s?.unrealizedPnl||0)>=0?"gain":"loss"}>{money(s?.unrealizedPnl||0)} · {pct(totalReturn)}</b></div></div></section>
  {(!s||s.balance===0)&&<section className="emptyStartCard"><div className="emptyIcon">A</div><div><h3>Your account is ready.</h3><p>New accounts start at $0. Fund your account to begin building a portfolio.</p></div><a className="primaryMoneyBtn" href="/transfers">Fund account</a></section>}
  <div className="proDashboardGrid"><section className="panel holdingsPanel"><div className="panelHead"><div><h3>Your investments</h3><span>{s?.holdings?.length||0} positions</span></div><a href="/portfolio">View portfolio →</a></div><div className="proHoldings">{(s?.holdings||[]).slice(0,6).map(h=><div className="holdingCardV2" key={h.id}>
    <div className="holdingCardTop"><AssetLogo symbol={h.symbol}/><div><b>{h.symbol}</b><small>{h.name}</small></div><div className="holdingCardPrice"><b>{money(h.currentValue)}</b><small>{h.shares.toLocaleString('en-US',{maximumFractionDigits:5})} shares</small></div></div>
    <div className="holdingCardMeta"><span>Purchased {purchaseDate(h.purchasedAt)}</span><span>Avg {money(h.entryPrice)}</span></div>
    <div className="holdingCardStats">
     <div><small>Total return</small><b className={h.pnl>=0?"gain":"loss"}>{h.pnl>=0?"+":""}{money(h.pnl)} · {pct(h.pnlPct)}</b></div>
     <div><small>Today</small><b className={h.dayPnl>=0?"gain":"loss"}>{h.dayPnl>=0?"+":""}{money(h.dayPnl)} · {pct(h.dayPct)}</b></div>
    </div>
   </div>)}{!s?.holdings?.length&&<div className="cleanEmpty"><b>No investments yet</b><span>Approved share allocations will appear here and move with their current quote.</span></div>}</div></section>
  <section className="panel accountSidePanel"><div className="panelHead"><div><h3>Account</h3><span>{s?.account?.id||"—"}</span></div></div><div className="accountMetric"><small>Pending allocations</small><b>{pending}</b></div><div className="accountMetric"><small>Unrealized gain/loss</small><b className={(s?.unrealizedPnl||0)>=0?"gain":"loss"}>{money(s?.unrealizedPnl||0)}</b></div><div className="accountMetric"><small>Recent transfers</small><b>{s?.transfers?.length||0}</b></div><div className="quickActionStack"><a href="/transfers">Deposit or withdraw <span>→</span></a><a href="/portfolio">Buy shares <span>→</span></a><a href="/support">Contact support <span>→</span></a></div></section></div>
  <section className="panel dailyPerformancePanel"><div className="panelHead"><div><h3>Daily performance</h3><span>Recent day-by-day account change</span></div></div><div className="dailyPerformanceList">{(s?.performanceHistory||[]).map(p=><div key={p.id}><b>{dayLabel(p.date)}</b><span className={p.amount>=0?"gain":"loss"}>{p.amount>=0?"+":""}{money(p.amount)}</span><span className={p.amount>=0?"gain":"loss"}>{pct(p.pct)}</span></div>)}{!s?.performanceHistory?.length&&<p className="subtle">No daily performance recorded yet.</p>}</div></section>
  <section className="panel relationshipSummaryCard"><div className="relationshipDocIcon">PDF</div><div className="relationshipDocCopy"><small>Client information</small><h3>Client Relationship Summary</h3><p>Understand Aether services, funding, investment requests, risks, fees and useful questions to ask our support team.</p></div><div className="relationshipDocActions"><a className="secondaryActionBtn" href="/api/client-document" target="_blank" rel="noreferrer">View PDF</a><a className="primaryMoneyBtn" href="/api/client-document?download=1">Download</a></div></section>
  <section className="panel recentActivityPanel"><div className="panelHead"><div><h3>Recent activity</h3><span>Money and allocation events</span></div></div><div className="activityList">{activity.map(a=><div key={a.key}><div><b>{a.title}</b><small>{new Date(a.createdAt).toLocaleString('en-US')}</small></div><div className="right"><b className={a.tone}>{a.tone==="neutral"?"":a.amount>=0?"+":""}{money(a.amount)}</b><small className={a.statusClass}>{a.status}</small></div></div>)}{!activity.length&&<p className="subtle">No account activity yet.</p>}</div></section>
 </section></AppShell>
}
