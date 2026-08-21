"use client"
import {useEffect,useMemo,useState} from "react"
import Link from "next/link"
import AdminShell from "@/components/AdminShell"
import type {Account,ShareAllocation,ShareControl,TransferRequest} from "@/lib/ops"
type Ops={accounts:Account[];allocations:ShareAllocation[];shareControls:ShareControl[];transfers:TransferRequest[]}
export default function AdminOverview(){
 const [ops,setOps]=useState<Ops|null>(null)
 useEffect(()=>{fetch("/api/admin/operations",{cache:"no-store"}).then(r=>r.ok?r.json():Promise.reject()).then(setOps).catch(()=>location.href="/login")},[])
 const pendingA=useMemo(()=>ops?.allocations.filter(x=>x.status==="Pending").length||0,[ops])
 const pendingT=useMemo(()=>ops?.transfers.filter(x=>x.status==="Pending").length||0,[ops])
 return <AdminShell><section className="adminPageV2">
  <div className="adminHeroV2"><div><span>Control center</span><h1>Good morning.</h1><p>Everything important across Aether, in one place.</p></div><Link href="/dashboard" className="adminPrimaryV2">View client app ↗</Link></div>
  <div className="adminStatGridV2">
   <Link href="/admin/clients"><small>Clients</small><b>{ops?.accounts.length||0}</b><span>Manage accounts →</span></Link>
   <Link href="/admin/markets"><small>Listed assets</small><b>{ops?.shareControls.length||0}</b><span>Update prices →</span></Link>
   <Link href="/admin/allocations"><small>Allocations waiting</small><b>{pendingA}</b><span>Review requests →</span></Link>
   <Link href="/admin/funding"><small>Transfers waiting</small><b>{pendingT}</b><span>Review funding →</span></Link>
  </div>
  <div className="adminQuickGridV2">
   <section><div className="sectionTitleV2"><div><h2>What needs attention</h2><p>Tasks that may require an admin decision.</p></div></div>
    <div className="attentionListV2">
     <Link href="/admin/allocations"><span className="attentionIconV2">✓</span><div><b>Share allocations</b><small>{pendingA} pending request{pendingA===1?"":"s"}</small></div><strong>Review</strong></Link>
     <Link href="/admin/funding"><span className="attentionIconV2">↕</span><div><b>Deposits & withdrawals</b><small>{pendingT} waiting for review</small></div><strong>Open</strong></Link>
     <Link href="/admin/content"><span className="attentionIconV2">✎</span><div><b>Public website</b><small>Edit homepage content and offerings</small></div><strong>Edit</strong></Link>
    </div>
   </section>
   <section className="adminGuideCardV2"><span>Aether Admin</span><h2>Designed for everyday use.</h2><p>Use the menu to manage one area at a time. Changes that affect clients are clearly separated from public website content.</p><Link href="/admin/markets">Manage markets →</Link></section>
  </div>
 </section></AdminShell>
}
