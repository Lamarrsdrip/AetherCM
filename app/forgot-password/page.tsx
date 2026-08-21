"use client"
import Link from 'next/link'
import Logo from '@/components/Logo'
import {useState} from 'react'
export default function Forgot(){
 const[email,setEmail]=useState(''),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false)
 async function go(e:React.FormEvent){e.preventDefault();setBusy(true);const r=await fetch('/api/auth/forgot-password',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email})});const d=await r.json();setBusy(false);setMsg(d.message||'If this email belongs to an Aether account, reset instructions have been sent.')}
 return <div className="authPage"><Link href="/"><Logo/></Link><form className="authCard" onSubmit={go}><span className="eyebrow">Account access</span><h1>Reset your password.</h1><p>Enter your account email and we’ll send a secure reset link.</p><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label>{msg&&<div className="formInfo">{msg}</div>}<button className="solidBtn" disabled={busy}>{busy?'Sending…':'Send reset link'}</button><div className="authFoot"><Link href="/login">Back to sign in</Link></div></form></div>
}
