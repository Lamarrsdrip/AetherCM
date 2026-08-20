'use client'
import Link from 'next/link'
import Logo from '@/components/Logo'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
export default function Register(){const r=useRouter(); const [form,setForm]=useState({name:'',email:'',password:''}); async function go(e:React.FormEvent){e.preventDefault(); await fetch('/api/auth/register',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(form)}); r.push('/dashboard')}
return <div className="authPage"><Link href="/"><Logo/></Link><form className="authCard" onSubmit={go}><span className="eyebrow">Open an account</span><h1>Start with clarity.</h1><p>Create your Aether profile. Identity, KYC and regulated brokerage onboarding must be connected before production use.</p><label>Full name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></label><label>Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></label><label>Password<input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required minLength={8}/></label><button className="solidBtn" type="submit">Create account</button><div className="authFoot">Already have an account? <Link href="/login">Log in</Link></div></form></div>}
