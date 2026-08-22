"use client"
import {useEffect,useState} from "react"
import {useRouter} from "next/navigation"
import AppShell from "@/components/AppShell"
import type {Account} from "@/lib/ops"

export default function ProfileHub(){
 const router=useRouter()
 const[account,setAccount]=useState<Account|null>(null)
 useEffect(()=>{fetch("/api/account/profile",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(d=>d&&setAccount(d.account))},[])

 const clientSince=account?new Date(account.createdAt).toLocaleDateString("en-US",{month:"long",year:"numeric"}):""
 const initials=account?.name?.split(" ").map(p=>p[0]).slice(0,2).join("").toUpperCase()||"AC"

 async function signOut(){
  await fetch("/api/auth/logout",{method:"POST"})
  router.push("/login")
 }

 return <AppShell><section className="workspace modernWorkspace">
  <div className="workspaceHead appPageHead"><div><span className="eyebrow">Account</span><h1>Profile</h1><p>Manage your personal information, security and preferences.</p></div></div>

  <section className="panel profileHeaderCard">
   {account?.avatarUrl?<img className="profileAvatarImg" src={account.avatarUrl} alt={account.name}/>:<span className="profileAvatarFallback">{initials}</span>}
   <div><h2>{account?.name||"—"}</h2><p>{account?"Client since "+clientSince:""}</p></div>
  </section>

  <section className="panel profileRowList">
   <a href="/profile/personal"><div><b>Personal information</b><small>Name, phone, address</small></div><span>→</span></a>
   <a href="/profile/security"><div><b>Password & security</b><small>Change your password, review account security</small></div><span>→</span></a>
   <a href="/profile/notifications"><div><b>Notifications</b><small>Push, email and update preferences</small></div><span>→</span></a>
   <a href="/api/client-document" target="_blank" rel="noreferrer"><div><b>Documents</b><small>Client Relationship Summary</small></div><span>→</span></a>
   <a href="/support"><div><b>Support</b><small>Message the Aether team</small></div><span>→</span></a>
   <button className="profileSignOutRow" onClick={signOut}><div><b>Sign out</b></div><span>→</span></button>
  </section>
 </section></AppShell>
}
