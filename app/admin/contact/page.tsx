"use client"
import {useEffect,useState} from 'react'
import AdminShell from '@/components/AdminShell'
type Submission={id:string;name:string;email:string;phone?:string;subject:string;message:string;status:'new'|'read'|'resolved'|'archived';createdAt:string}

export default function AdminContact(){
 const[items,setItems]=useState<Submission[]>([]),[selected,setSelected]=useState('')
 const load=()=>fetch('/api/admin/contact',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(d=>d&&setItems(d.submissions||[]))
 useEffect(()=>{load();const id=setInterval(load,20000);return()=>clearInterval(id)},[])
 const current=items.find(x=>x.id===selected)
 async function act(action:string,id:string){
  await fetch('/api/admin/contact',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action,id})})
  load()
  if(action==='delete'&&selected===id)setSelected('')
 }
 async function open(item:Submission){
  setSelected(item.id)
  if(item.status==='new')await act('mark-read',item.id)
 }
 return <AdminShell><section className="adminPageV2"><div className="pageHeadV2"><div><span>Client care</span><h1>Contact requests</h1><p>Messages submitted from the homepage contact form.</p></div></div>
  <div className="supportDesk"><aside>{items.length?items.map(t=><button key={t.id} className={selected===t.id?'active':''} onClick={()=>open(t)}><b>{t.name}</b><small>{t.subject}</small><span>{new Date(t.createdAt).toLocaleString('en-US')}</span><strong className={`contactStatusPill ${t.status}`}>{t.status}</strong></button>):<div className="emptySupport">No contact submissions yet.</div>}</aside>
  <section>{current?<div className="contactDetailV2">
    <div className="contactDetailHead"><div><b>{current.name}</b><small>{current.email}{current.phone?` · ${current.phone}`:''}</small></div><strong className={`contactStatusPill ${current.status}`}>{current.status}</strong></div>
    <h3>{current.subject}</h3>
    <p className="contactDetailMessage">{current.message}</p>
    <small className="contactDetailDate">Submitted {new Date(current.createdAt).toLocaleString('en-US')}</small>
    <div className="contactDetailActions">
     <button onClick={()=>act('mark-read',current.id)}>Mark read</button>
     <button onClick={()=>act('mark-resolved',current.id)}>Mark resolved</button>
     <button onClick={()=>act('archive',current.id)}>Archive</button>
     <button className="danger" onClick={()=>act('delete',current.id)}>Delete</button>
    </div>
   </div>:<div className="selectConversation">Choose a message to view.</div>}</section>
  </div></section></AdminShell>
}
