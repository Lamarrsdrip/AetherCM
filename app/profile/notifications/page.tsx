"use client"
import {useEffect,useState} from "react"
import Link from "next/link"
import AppShell from "@/components/AppShell"
import type {Account, NotificationPreferences} from "@/lib/ops"
import {defaultNotificationPreferences} from "@/lib/ops"

export default function Notifications(){
 const[prefs,setPrefs]=useState<NotificationPreferences>(defaultNotificationPreferences)
 const[saved,setSaved]=useState(false)

 useEffect(()=>{fetch("/api/account/profile",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(d=>{
  const a:Account|undefined=d?.account
  if(a?.notificationPreferences)setPrefs(a.notificationPreferences)
 })},[])

 async function save(next:NotificationPreferences){
  setPrefs(next)
  const r=await fetch("/api/account/profile",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({notificationPreferences:next})})
  if(r.ok){setSaved(true);setTimeout(()=>setSaved(false),1500)}
 }
 const toggle=(key:keyof NotificationPreferences)=>save({...prefs,[key]:!prefs[key]})

 const Row=({label,desc,checked,onChange}:{label:string;desc:string;checked:boolean;onChange:()=>void})=>
  <label className="notifToggleRow"><div><b>{label}</b><small>{desc}</small></div><input type="checkbox" checked={checked} onChange={onChange}/></label>

 return <AppShell><section className="workspace modernWorkspace">
  <Link className="backToMarketsLink" href="/profile">← Back to profile</Link>
  <div className="workspaceHead appPageHead"><div><span className="eyebrow">Profile</span><h1>Notifications</h1><p>Choose how Aether reaches you. {saved&&<span className="gain">Saved.</span>}</p></div></div>

  <section className="panel">
   <div className="sectionTitleV2"><div><h2>Channels</h2><p>Turn a channel off to silence every notification sent through it.</p></div></div>
   <Row label="Push notifications" desc="Alerts sent to this device" checked={prefs.push} onChange={()=>toggle("push")}/>
   <Row label="Email notifications" desc="Alerts sent to your account email" checked={prefs.email} onChange={()=>toggle("email")}/>
  </section>

  <section className="panel">
   <div className="sectionTitleV2"><div><h2>What you're notified about</h2></div></div>
   <Row label="Investment updates" desc="Allocation approvals, daily profit/loss" checked={prefs.investmentUpdates} onChange={()=>toggle("investmentUpdates")}/>
   <Row label="Deposit/withdrawal updates" desc="Funding and account credit/debit status" checked={prefs.transferUpdates} onChange={()=>toggle("transferUpdates")}/>
   <Row label="Support replies" desc="When the Aether team replies to your messages" checked={prefs.supportReplies} onChange={()=>toggle("supportReplies")}/>
   <div className="notifToggleRow notifToggleLocked"><div><b>Security alerts</b><small>Password changes and account security — always on</small></div><span className="alwaysOnPill">Always on</span></div>
  </section>
 </section></AppShell>
}
