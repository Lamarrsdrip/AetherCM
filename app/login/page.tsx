"use client"
import Link from 'next/link'
import Logo from '@/components/Logo'
import {useState} from 'react'
import {useRouter} from 'next/navigation'
export default function Login(){
 const r=useRouter(),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[err,setErr]=useState(''),[busy,setBusy]=useState(false)
 async function go(e:React.FormEvent){e.preventDefault();setErr('');setBusy(true);const res=await fetch('/api/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password})});const d=await res.json().catch(()=>({}));setBusy(false);if(!res.ok)return setErr(d.error||'We could not sign you in.');r.push(d.role==='admin'?'/admin':'/dashboard')}
 return <div className="authPage"><Link href="/"><Logo/></Link><form className="authCard" onSubmit={go}><span className="eyebrow">Welcome back</span><h1>Sign in to Aether.</h1><p>Access your account, portfolio and money activity.</p><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" required/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required/></label><div className="authAssist"><Link href="/forgot-password">Forgot password?</Link></div>{err&&<div className="formError">{err}</div>}<button className="solidBtn" disabled={busy} type="submit">{busy?'Signing in…':'Sign in'}</button><div className="authFoot">New to Aether? <Link href="/register">Open an account</Link></div></form></div>
}
