"use client"
import {useState} from 'react'

export default function ContactForm(){
 const[form,setForm]=useState({name:'',email:'',phone:'',subject:'',message:''})
 const[status,setStatus]=useState<'idle'|'sending'|'sent'|'error'>('idle')
 const[error,setError]=useState('')
 const set=(k:string,v:string)=>setForm({...form,[k]:v})

 async function submit(e:React.FormEvent){
  e.preventDefault()
  setStatus('sending');setError('')
  const r=await fetch('/api/contact',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(form)})
  const d=await r.json().catch(()=>({}))
  if(!r.ok){setStatus('error');setError(d.error||'We could not send your message. Please try again.');return}
  setStatus('sent')
  setForm({name:'',email:'',phone:'',subject:'',message:''})
 }

 if(status==='sent'){
  return <div className="contactFormSent"><b>Message sent.</b><p>Thank you for reaching out — our team will respond soon.</p></div>
 }

 return <form className="contactFormV2" onSubmit={submit}>
  <div className="contactFormRow">
   <label>Full name<input required value={form.name} onChange={e=>set('name',e.target.value)}/></label>
   <label>Email<input required type="email" value={form.email} onChange={e=>set('email',e.target.value)}/></label>
  </div>
  <div className="contactFormRow">
   <label>Phone (optional)<input value={form.phone} onChange={e=>set('phone',e.target.value)}/></label>
   <label>Subject<input required value={form.subject} onChange={e=>set('subject',e.target.value)}/></label>
  </div>
  <label className="contactFormMessage">Message<textarea required rows={5} value={form.message} onChange={e=>set('message',e.target.value)}/></label>
  <button className="solidBtn" type="submit" disabled={status==='sending'}>{status==='sending'?'Sending…':'Send message'}</button>
  {status==='error'&&<div className="formInfo">{error}</div>}
 </form>
}
