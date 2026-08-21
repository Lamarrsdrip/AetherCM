"use client"
import {useEffect,useState} from 'react'
import AdminShell from '@/components/AdminShell'
export default function Communications(){
 const[s,setS]=useState<any>(null),[msg,setMsg]=useState('')
 const load=()=>fetch('/api/admin/communications/status',{cache:'no-store'}).then(r=>r.json()).then(setS)
 useEffect(()=>{load()},[])
 async function test(path:string){setMsg('Checking…');const r=await fetch(path,{method:'POST'});const d=await r.json().catch(()=>({}));setMsg(r.ok?'Working successfully.':d.error||'This service still needs to be connected.');load()}
 const Card=({title,ok,body}:{title:string,ok:boolean,body:string})=><article className={ok?'commCard connected':'commCard'}><span>{ok?'✓':'!'}</span><div><b>{title}</b><p>{body}</p></div><strong>{ok?'Connected':'Needs setup'}</strong></article>
 return <AdminShell><section className="adminPageV2"><div className="pageHeadV2"><div><span>Communication</span><h1>Messages & account alerts</h1><p>See which client communication services are ready.</p></div></div><div className="commGrid"><Card title="Saved account data" ok={!!s?.database?.connected} body="Keeps accounts, balances, requests and settings safely between deployments."/><Card title="Email" ok={!!s?.email?.configured} body="Sends welcome, password reset, request and support emails."/><Card title="Push alerts" ok={!!s?.push?.configured} body="Sends account updates to phones and installed Aether apps."/><Card title="Add to Home Screen" ok={true} body="Lets clients install Aether from supported phones and browsers."/></div><div className="commActions"><button onClick={()=>test('/api/admin/communications/test-email')}>Send test email</button><button onClick={()=>test('/api/admin/communications/test-push')}>Send test alert</button></div>{msg&&<div className="formInfo">{msg}</div>}</section></AdminShell>
}
