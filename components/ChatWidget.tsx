'use client'
import { useState } from 'react'
import { Icon } from './Icons'
export default function ChatWidget(){
 const [open,setOpen]=useState(false); const [text,setText]=useState(''); const [msgs,setMsgs]=useState([{from:'team',text:'Hi — Aether Support here. How can we help?'}])
 const send=()=>{if(!text.trim())return; setMsgs([...msgs,{from:'you',text:text.trim()}]); setText(''); setTimeout(()=>setMsgs(m=>[...m,{from:'team',text:'Thanks. A specialist will review this shortly.'}]),350)}
 return <><button className="chatFab" onClick={()=>setOpen(!open)} aria-label="Live chat"><Icon name="chat"/></button>{open&&<div className="chatPanel"><div className="chatHead"><div><b>Live support</b><small>Typically replies in a few minutes</small></div><button onClick={()=>setOpen(false)}>×</button></div><div className="chatBody">{msgs.map((m,i)=><div key={i} className={'bubble '+m.from}>{m.text}</div>)}</div><div className="chatInput"><input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Message support"/><button onClick={send}><Icon name="send" size={18}/></button></div></div>}</>
}
