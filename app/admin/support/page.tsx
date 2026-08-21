"use client"
import {useEffect,useMemo,useState} from 'react'
import AdminShell from '@/components/AdminShell'
type Msg={id:string;userId:string;userName:string;email:string;from:'client'|'team';text:string;createdAt:string}

export default function AdminSupport(){
 const[msg,setMsg]=useState<Msg[]>([]),[selected,setSelected]=useState(''),[text,setText]=useState('')
 const load=()=>fetch('/api/admin/support',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(d=>d&&setMsg(d.messages||[]))
 useEffect(()=>{load();const id=setInterval(load,12000);return()=>clearInterval(id)},[])
 const threads=useMemo(()=>{const m=new Map<string,Msg>();for(const x of msg)if(!m.has(x.userId))m.set(x.userId,x);return [...m.values()]},[msg])
 const conversation=msg.filter(x=>x.userId===selected).sort((a,b)=>a.createdAt.localeCompare(b.createdAt))
 async function send(){if(!selected||!text.trim())return;const r=await fetch('/api/admin/support',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({userId:selected,text})});if(r.ok){setText('');load()}}
 return <AdminShell><section className="adminPageV2"><div className="pageHeadV2"><div><span>Client care</span><h1>Support conversations</h1><p>Read client messages and reply from one place.</p></div></div><div className="supportDesk"><aside>{threads.length?threads.map(t=><button key={t.userId} className={selected===t.userId?'active':''} onClick={()=>setSelected(t.userId)}><b>{t.userName}</b><small>{t.email}</small><span>{t.text.slice(0,70)}</span></button>):<div className="emptySupport">No support messages yet.</div>}</aside><section>{selected?<><div className="supportConversation">{conversation.map(m=><div key={m.id} className={m.from==='team'?'team':'client'}><b>{m.from==='team'?'Aether Support':m.userName}</b><p>{m.text}</p><small>{new Date(m.createdAt).toLocaleString()}</small></div>)}</div><div className="supportReply"><textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Write a helpful reply"/><button onClick={send}>Send reply</button></div></>:<div className="selectConversation">Choose a conversation to reply.</div>}</section></div></section></AdminShell>
}
