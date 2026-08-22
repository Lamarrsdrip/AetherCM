"use client"
import {useEffect,useState} from 'react'
import AdminShell from '@/components/AdminShell'
import type {EmailConfig} from '@/lib/ops'

export default function Communications(){
 const[s,setS]=useState<any>(null),[msg,setMsg]=useState('')
 const[email,setEmail]=useState<EmailConfig|null>(null),[savedEmail,setSavedEmail]=useState(false)
 const load=()=>fetch('/api/admin/communications/status',{cache:'no-store'}).then(r=>r.json()).then(setS)
 const loadOps=()=>fetch('/api/admin/operations',{cache:'no-store'}).then(r=>r.json()).then(d=>setEmail(d.emailConfig))
 useEffect(()=>{load();loadOps()},[])
 async function test(path:string){setMsg('Checking…');const r=await fetch(path,{method:'POST'});const d=await r.json().catch(()=>({}));setMsg(r.ok?'Working successfully.':d.error||'This service still needs to be connected.');load()}
 const Card=({title,ok,body}:{title:string,ok:boolean,body:string})=><article className={ok?'commCard connected':'commCard'}><span>{ok?'✓':'!'}</span><div><b>{title}</b><p>{body}</p></div><strong>{ok?'Connected':'Needs setup'}</strong></article>

 async function saveEmail(){
  if(!email)return
  const r=await fetch('/api/admin/operations',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'email-config',patch:email})})
  const d=await r.json()
  if(r.ok){setEmail(d.emailConfig);setSavedEmail(true);setTimeout(()=>setSavedEmail(false),1800);load()}
 }

 return <AdminShell><section className="adminPageV2"><div className="pageHeadV2"><div><span>Communication</span><h1>Messages & account alerts</h1><p>See which client communication services are ready.</p></div></div><div className="commGrid"><Card title="Saved account data" ok={!!s?.database?.connected} body="Keeps accounts, balances, requests and settings safely between deployments."/><Card title="Email" ok={!!s?.email?.configured} body="Sends welcome, password reset, request and support emails."/><Card title="Push alerts" ok={!!s?.push?.configured} body="Sends account updates to phones and installed Aether apps."/><Card title="Add to Home Screen" ok={true} body="Lets clients install Aether from supported phones and browsers."/></div><div className="commActions"><button onClick={()=>test('/api/admin/communications/test-email')}>Send test email</button><button onClick={()=>test('/api/admin/communications/test-push')}>Send test alert</button></div>{msg&&<div className="formInfo">{msg}</div>}

 {email&&<section className="adminSectionCardV2 emailConfigCardV2">
  <div className="sectionTitleV2"><div><h2>Email — Google account</h2><p>Send Aether emails from a Gmail address using an app password. This overrides any email provider set in your deployment environment.</p></div></div>
  <div className="contentFormV2">
   <label><input type="checkbox" checked={email.enabled} onChange={e=>setEmail({...email,enabled:e.target.checked})}/> Enabled</label>
   <label>From name<input value={email.fromName} onChange={e=>setEmail({...email,fromName:e.target.value})}/></label>
   <label>Gmail address<input value={email.gmailAddress} onChange={e=>setEmail({...email,gmailAddress:e.target.value})} placeholder="accounts@yourcompany.com"/></label>
   <label>App password<input type="password" value={email.appPassword} onChange={e=>setEmail({...email,appPassword:e.target.value})} placeholder={email.appPassword?'Leave unchanged, or paste a new one':'16-character app password'}/></label>
  </div>
  <p className="emailConfigHintV2">
   Use a Google Account with 2-Step Verification turned on, then create an app password at{' '}
   <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer">myaccount.google.com/apppasswords</a>.
   Paste that 16-character password here — not your regular Gmail password.
  </p>
  <button className="saveActionV2" onClick={saveEmail}>{savedEmail?'✓ Saved':'Save email settings'}</button>
 </section>}
 </section></AdminShell>
}
