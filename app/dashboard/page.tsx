"use client"
import {useEffect,useState} from "react"
import AppShell from "@/components/AppShell"
import type {AccountAdjustment,HoldingView,ShareAllocation,TransferRequest} from "@/lib/ops"

type Snap={
 balance:number;available:number;invested:number;investedCost:number;unrealizedPnl:number;dayPnl:number;
 holdings:HoldingView[];daily:AccountAdjustment[];allocations:ShareAllocation[];transfers:TransferRequest[];
 account:{id:string;email:string;name:string}
}
const money=(n=0)=>n.toLocaleString(undefined,{style:"currency",currency:"USD",minimumFractionDigits:2,maximumFractionDigits:2})
const pct=(n=0)=>`${n>=0?"+":""}${n.toFixed(2)}%`

export default function Dashboard(){
 const [s,setS]=useState<Snap|null>(null)
 useEffect(()=>{fetch("/api/account",{cache:"no-store"}).then(r=>r.json()).then(setS)},[])
 const pending=s?.allocations?.filter(a=>a.status==="Pending").length||0
 const totalReturn=s?.investedCost?((s.invested-s.investedCost)/s.investedCost*100):0
 return <AppShell><section className="workspace modernWorkspace">
  <div className="workspaceHead appPageHead"><div><span className="eyebrow">Overview</span><h1>{s?.account?.name?`Welcome, ${s.account.name.split(" ")[0]}.`:"Your account."}</h1><p>A clear view of cash, invested assets and market performance.</p></div><div className="headActions"><a className="primaryMoneyBtn" href="/transfers">＋ Add money</a><a className="secondaryActionBtn" href="/portfolio">Invest</a></div></div>
  <section className="heroBalanceCard"><div className="heroBalanceMain"><small>Total account value</small><h2>{money(s?.balance||0)}</h2><div className="marketLine"><span className={(s?.dayPnl||0)>=0?"gain":"loss"}>{(s?.dayPnl||0)>=0?"+":""}{money(s?.dayPnl||0)} today</span><span>Market-linked holdings update from current platform quotes</span></div></div><div className="heroBalanceStats"><div><small>Available cash</small><b>{money(s?.available||0)}</b></div><div><small>Invested</small><b>{money(s?.invested||0)}</b></div><div><small>Total return</small><b className={(s?.unrealizedPnl||0)>=0?"gain":"loss"}>{money(s?.unrealizedPnl||0)} · {pct(totalReturn)}</b></div></div></section>
  {(!s||s.balance===0)&&<section className="emptyStartCard"><div className="emptyIcon">A</div><div><h3>Your account is ready.</h3><p>New accounts start at $0. Fund your account to begin building a portfolio.</p></div><a className="primaryMoneyBtn" href="/transfers">Fund account</a></section>}
  <div className="proDashboardGrid"><section className="panel holdingsPanel"><div className="panelHead"><div><h3>Your investments</h3><span>{s?.holdings?.length||0} positions</span></div><a href="/portfolio">View portfolio →</a></div><div className="proHoldings">{(s?.holdings||[]).slice(0,6).map(h=><div className="holdingRow" key={h.id}><div className="tickerTile">{h.symbol.slice(0,2)}</div><div className="holdingIdentity"><b>{h.symbol}</b><small>{h.shares.toLocaleString(undefined,{maximumFractionDigits:5})} shares · avg {money(h.entryPrice)}</small></div><div className="holdingMarket"><b>{money(h.currentValue)}</b><small className={h.dayPnl>=0?"gain":"loss"}>{h.dayPnl>=0?"+":""}{money(h.dayPnl)} today · {pct(h.dayPct)}</small></div></div>)}{!s?.holdings?.length&&<div className="cleanEmpty"><b>No investments yet</b><span>Approved share allocations will appear here and move with their current quote.</span></div>}</div></section>
  <section className="panel accountSidePanel"><div className="panelHead"><div><h3>Account</h3><span>{s?.account?.id||"—"}</span></div></div><div className="accountMetric"><small>Pending allocations</small><b>{pending}</b></div><div className="accountMetric"><small>Unrealized gain/loss</small><b className={(s?.unrealizedPnl||0)>=0?"gain":"loss"}>{money(s?.unrealizedPnl||0)}</b></div><div className="accountMetric"><small>Recent transfers</small><b>{s?.transfers?.length||0}</b></div><div className="quickActionStack"><a href="/transfers">Deposit or withdraw <span>→</span></a><a href="/portfolio">Buy shares <span>→</span></a><a href="/support">Contact support <span>→</span></a></div></section></div>
  <section className="panel recentActivityPanel"><div className="panelHead"><div><h3>Recent activity</h3><span>Money and allocation events</span></div></div><div className="activityList">{(s?.transfers||[]).slice(0,5).map(t=><div key={t.id}><div><b>{t.direction} · {t.method.toUpperCase()}</b><small>{t.createdAt}</small></div><div className="right"><b>{money(t.amount)}</b><small className={t.status.toLowerCase()}>{t.status}</small></div></div>)}{!s?.transfers?.length&&<p className="subtle">No account activity yet.</p>}</div></section>
 </section></AppShell>
}
