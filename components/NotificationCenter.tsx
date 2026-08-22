"use client"
import {useEffect,useState} from 'react'

type Notice={id:string;title:string;body:string;href:string;read:boolean;createdAt:string}

export default function NotificationCenter(){
  const[open,setOpen]=useState(false),[items,setItems]=useState<Notice[]>([]),[unread,setUnread]=useState(0)
  const load=()=>fetch('/api/notifications',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(d=>{if(d){setItems(d.notices||[]);setUnread(d.unread||0)}}).catch(()=>{})
  useEffect(()=>{load();const id=setInterval(load,30000);return()=>clearInterval(id)},[])
  async function read(n:Notice){
    await fetch('/api/notifications',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:n.id})})
    location.href=n.href
  }
  return <div className="noticeWrap">
    <button className="noticeBell" onClick={()=>{setOpen(!open);if(!open)load()}} aria-label="Account notifications">♡{unread>0&&<span>{unread>9?'9+':unread}</span>}</button>
    {open&&<div className="noticePanel"><div className="noticeHead"><b>Account updates</b><button onClick={()=>setOpen(false)}>×</button></div><div className="noticeList">{items.length?items.map(n=><button key={n.id} className={n.read?'':'unread'} onClick={()=>read(n)}><b>{n.title}</b><span>{n.body}</span><small>{new Date(n.createdAt).toLocaleString('en-US')}</small></button>):<div className="noticeEmpty">You’re all caught up.</div>}</div></div>}
  </div>
}
