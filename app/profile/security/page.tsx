"use client"
import {useEffect,useState} from "react"
import Link from "next/link"
import AppShell from "@/components/AppShell"
import type {Account} from "@/lib/ops"

export default function Security(){
 const[account,setAccount]=useState<Account|null>(null)
 const[form,setForm]=useState({currentPassword:"",newPassword:"",confirmPassword:""})
 const[status,setStatus]=useState<"idle"|"saving"|"saved"|"error">("idle"),[error,setError]=useState("")

 useEffect(()=>{fetch("/api/account/profile",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(d=>d&&setAccount(d.account))},[])

 async function changePassword(){
  setStatus("saving");setError("")
  const r=await fetch("/api/account/password",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(form)})
  const d=await r.json().catch(()=>({}))
  if(!r.ok){setStatus("error");setError(d.error||"We could not update your password.");return}
  setStatus("saved");setForm({currentPassword:"",newPassword:"",confirmPassword:""})
  setTimeout(()=>setStatus("idle"),2500)
 }

 return <AppShell><section className="workspace modernWorkspace">
  <Link className="backToMarketsLink" href="/profile">← Back to profile</Link>
  <div className="workspaceHead appPageHead"><div><span className="eyebrow">Profile</span><h1>Password & security</h1><p>Keep your account secure.</p></div></div>

  <section className="panel">
   <div className="sectionTitleV2"><div><h2>Account security</h2></div></div>
   <div className="accountMetric"><small>Email</small><b>{account?.email||"—"}</b></div>
   <div className="accountMetric"><small>Account created</small><b>{account?new Date(account.createdAt).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}):"—"}</b></div>
   <div className="accountMetric"><small>Last sign-in</small><b>{account?.lastLoginAt?new Date(account.lastLoginAt).toLocaleString("en-US"):"This session"}</b></div>
   <div className="accountMetric"><small>Security alerts</small><b>Always on</b></div>
  </section>

  <section className="panel">
   <div className="sectionTitleV2"><div><h2>Change password</h2><p>You'll stay signed in on this device after changing your password.</p></div></div>
   <div className="contentFormV2">
    <label className="wideV2">Current password<input type="password" value={form.currentPassword} onChange={e=>setForm({...form,currentPassword:e.target.value})}/></label>
    <label>New password<input type="password" value={form.newPassword} onChange={e=>setForm({...form,newPassword:e.target.value})}/></label>
    <label>Confirm new password<input type="password" value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})}/></label>
   </div>
   <button className="primaryMoneyBtn" onClick={changePassword} disabled={status==="saving"||!form.currentPassword||!form.newPassword}>{status==="saving"?"Updating…":status==="saved"?"✓ Password updated":"Update password"}</button>
   {status==="error"&&<div className="formInfo">{error}</div>}
   <small className="subtle">Use at least 10 characters. We'll email you a confirmation any time your password changes.</small>
  </section>
 </section></AppShell>
}
