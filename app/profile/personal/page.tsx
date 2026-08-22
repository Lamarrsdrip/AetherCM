"use client"
import {useEffect,useState} from "react"
import Link from "next/link"
import AppShell from "@/components/AppShell"
import type {Account} from "@/lib/ops"

export default function PersonalInfo(){
 const[account,setAccount]=useState<Account|null>(null)
 const[form,setForm]=useState({name:"",phone:"",avatarUrl:"",line1:"",line2:"",city:"",state:"",postalCode:"",country:""})
 const[saved,setSaved]=useState(false),[error,setError]=useState("")

 useEffect(()=>{fetch("/api/account/profile",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(d=>{
  if(!d)return
  const a:Account=d.account
  setAccount(a)
  setForm({
   name:a.name||"",phone:a.phone||"",avatarUrl:a.avatarUrl||"",
   line1:a.address?.line1||"",line2:a.address?.line2||"",city:a.address?.city||"",
   state:a.address?.state||"",postalCode:a.address?.postalCode||"",country:a.address?.country||""
  })
 })},[])

 const set=(k:string,v:string)=>setForm({...form,[k]:v})

 async function save(){
  setSaved(false);setError("")
  const r=await fetch("/api/account/profile",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({
   name:form.name,phone:form.phone,avatarUrl:form.avatarUrl,
   address:{line1:form.line1,line2:form.line2,city:form.city,state:form.state,postalCode:form.postalCode,country:form.country}
  })})
  const d=await r.json().catch(()=>({}))
  if(!r.ok){setError(d.error||"We could not save your changes.");return}
  setAccount(d.account);setSaved(true);setTimeout(()=>setSaved(false),1800)
 }

 return <AppShell><section className="workspace modernWorkspace">
  <Link className="backToMarketsLink" href="/profile">← Back to profile</Link>
  <div className="workspaceHead appPageHead"><div><span className="eyebrow">Profile</span><h1>Personal information</h1><p>Keep your account details up to date.</p></div></div>

  <section className="panel">
   <div className="contentFormV2">
    <label>Full name<input value={form.name} onChange={e=>set("name",e.target.value)}/></label>
    <label>Email<input value={account?.email||""} disabled/></label>
    <label>Phone<input value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="+1 555 000 0000"/></label>
    <label>Avatar URL (optional)<input value={form.avatarUrl} onChange={e=>set("avatarUrl",e.target.value)} placeholder="https://…"/></label>
   </div>
   <small className="subtle">Email is your sign-in identity and can't be changed here. Contact support if you need to update it.</small>
  </section>

  <section className="panel">
   <div className="sectionTitleV2"><div><h2>Address</h2></div></div>
   <div className="contentFormV2">
    <label>Address line 1<input value={form.line1} onChange={e=>set("line1",e.target.value)}/></label>
    <label>Address line 2 (optional)<input value={form.line2} onChange={e=>set("line2",e.target.value)}/></label>
    <label>City<input value={form.city} onChange={e=>set("city",e.target.value)}/></label>
    <label>State / region<input value={form.state} onChange={e=>set("state",e.target.value)}/></label>
    <label>Postal code<input value={form.postalCode} onChange={e=>set("postalCode",e.target.value)}/></label>
    <label>Country<input value={form.country} onChange={e=>set("country",e.target.value)}/></label>
   </div>
   <button className="primaryMoneyBtn" onClick={save}>{saved?"✓ Saved":"Save changes"}</button>
   {error&&<div className="formInfo">{error}</div>}
  </section>
 </section></AppShell>
}
