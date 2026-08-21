"use client"
import Link from 'next/link'
import Logo from '@/components/Logo'
import {useState} from 'react'
import {useRouter} from 'next/navigation'
export default function Register(){
 const r=useRouter(),[form,setForm]=useState({name:'',email:'',password:''}),[err,setErr]=useState(''),[busy,setBusy]=useState(false)
 async function go(e:React.FormEvent){e.preventDefault();setErr('');setBusy(true);const res=await fetch('/api/auth/register',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(form)});const d=await res.json().catch(()=>({}));setBusy(false);if(!res.ok)return setErr(d.error||'We could not create your account.');r.push('/dashboard')}
 return <div className="authPage"><Link href="/"><Logo/></Link><form className="authCard" onSubmit={go}><span className="eyebrow">Open an account</span><h1>Start with Aether.</h1><p>Create your secure account and keep your portfolio, money activity and support in one place.</p><label>Full name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} autoComplete="name" required/></label><label>Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} autoComplete="email" required/></label><label>Password<input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} autoComplete="new-password" required minLength={10}/><small>Use at least 10 characters.</small></label>{err&&<div className="formError">{err}</div>}<button className="solidBtn" disabled={busy} type="submit">{busy?'Creating account…':'Create account'}</button><div className="authFoot">Already have an account? <Link href="/login">Sign in</Link></div></form></div>
}
