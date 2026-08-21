"use client"
import Link from 'next/link'
import Logo from '@/components/Logo'
import {useRouter} from 'next/navigation'
import {useEffect,useState} from 'react'
export default function Reset(){
 const r=useRouter(),[token,setToken]=useState(''),[password,setPassword]=useState(''),[err,setErr]=useState(''),[busy,setBusy]=useState(false)
 useEffect(()=>{setToken(new URLSearchParams(window.location.search).get('token')||'')},[])
 async function go(e:React.FormEvent){e.preventDefault();setBusy(true);setErr('');const res=await fetch('/api/auth/reset-password',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token,password})});const d=await res.json().catch(()=>({}));setBusy(false);if(!res.ok)return setErr(d.error||'We could not reset your password.');r.push('/login')}
 return <div className="authPage"><Link href="/"><Logo/></Link><form className="authCard" onSubmit={go}><span className="eyebrow">Account access</span><h1>Choose a new password.</h1><p>Use at least 10 characters.</p><label>New password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} minLength={10} required autoComplete="new-password"/></label>{err&&<div className="formError">{err}</div>}<button className="solidBtn" disabled={busy||!token}>{busy?'Saving…':'Save new password'}</button></form></div>
}
