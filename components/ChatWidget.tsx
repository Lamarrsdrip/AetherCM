"use client"
import {useEffect,useRef,useState} from 'react'
import Link from 'next/link'
import {Icon} from './Icons'

type Msg={id:string;from:'client'|'team';text:string;createdAt:string}

const CATEGORY_LABELS:Record<string,string>={
 ACCOUNT_ACCESS:'Account access',MONEY:'Money',INVESTMENTS:'Investments',ACCOUNT_ACTIVITY:'Account activity'
}

export default function ChatWidget(){
 const[open,setOpen]=useState(false),[text,setText]=useState(''),[msgs,setMsgs]=useState<Msg[]>([]),[signed,setSigned]=useState<boolean|null>(null),[sending,setSending]=useState(false)
 const[category,setCategory]=useState<string|undefined>(undefined)
 const body=useRef<HTMLDivElement>(null)

 async function load(){
   const session=await fetch('/api/auth/session',{cache:'no-store'}).then(r=>r.json()).catch(()=>({session:null}))
   setSigned(Boolean(session.session))
   if(!session.session)return
   const d=await fetch('/api/support/messages',{cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null)
   if(d)setMsgs(d.messages||[])
 }
 useEffect(()=>{if(open){load();const id=setInterval(load,10000);return()=>clearInterval(id)}},[open])
 useEffect(()=>{body.current?.scrollTo({top:body.current.scrollHeight,behavior:'smooth'})},[msgs])
 useEffect(()=>{
  const handler=(e:Event)=>{
   const detail=(e as CustomEvent<{category?:string}>).detail
   setOpen(true)
   if(detail?.category)setCategory(detail.category)
  }
  window.addEventListener('aether:open-chat',handler)
  return ()=>window.removeEventListener('aether:open-chat',handler)
 },[])

 async function send(){
   const value=text.trim()
   if(!value||sending)return
   setSending(true)
   const r=await fetch('/api/support/messages',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({text:value,category})})
   if(r.ok){setText('');setCategory(undefined);await load()}
   setSending(false)
 }
 return <><button className="chatFab" onClick={()=>setOpen(!open)} aria-label="Aether Support"><Icon name="chat"/></button>{open&&<div className="chatPanel"><div className="chatHead"><div><b>Aether Support</b><small>Messages stay connected to your account</small></div><button onClick={()=>setOpen(false)}>×</button></div>{signed===false?<div className="chatSignIn"><b>Sign in to message support</b><p>Your conversation will stay with your Aether account.</p><Link href="/login">Sign in</Link></div>:<><div className="chatBody" ref={body}>{msgs.length?msgs.map(m=><div key={m.id} className={'bubble '+(m.from==='client'?'you':'team')}><span>{m.text}</span><small>{new Date(m.createdAt).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}</small></div>):<div className="supportWelcome"><b>How can we help?</b><span>Send us a message and the Aether team can reply here.</span></div>}</div>{category&&<div className="chatCategoryChip"><span>{CATEGORY_LABELS[category]||category}</span><button onClick={()=>setCategory(undefined)}>×</button></div>}<div className="chatInput"><input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Write a message"/><button disabled={sending} onClick={send}><Icon name="send" size={18}/></button></div></>}</div>}</>
}
