'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Logo from './Logo'
import { Icon } from './Icons'

const links=[['/dashboard','Overview','spark'],['/portfolio','Portfolio','wallet'],['/markets','Markets','trend'],['/transfers','Money','plus'],['/support','Support','chat']]

type Session={role:'admin'|'client';email:string}|null

export default function AppShell({children}:{children:React.ReactNode}){
 const path=usePathname()
 const [session,setSession]=useState<Session>(null)

 useEffect(()=>{
   fetch('/api/auth/session',{cache:'no-store'})
     .then(r=>r.ok?r.json():null)
     .then(d=>setSession(d?.session||null))
     .catch(()=>setSession(null))
 },[])

 const isAdmin=session?.role==='admin'

 return <div className="appFrame">
  <aside className="appSide">
   <Link href="/dashboard"><Logo/></Link>
   <div className="sideLinks">
    {links.map(([href,label,icon])=><Link key={href} className={path===href?'active':''} href={href}><Icon name={icon}/><span>{label}</span></Link>)}
   </div>

   {isAdmin&&<div className="adminViewSwitch">
    <span className="adminViewDot">A</span>
    <div><b>Viewing client app</b><small>Admin authority remains active</small></div>
    <Link href="/admin">Admin</Link>
   </div>}

   <div className="sideFoot">
    <span className="avatar">{isAdmin?'AD':'AG'}</span>
    <div>
     <b>{isAdmin?'Aether Administrator':'Aether Client'}</b>
     <small>{isAdmin?'Client-view mode':'Individual account'}</small>
    </div>
   </div>
  </aside>

  <main className="appMain">
   <div className="appTop">
    <div><small>Aether Capital Markets</small><b>{isAdmin?'Client view · administrator session':'Private investing workspace'}</b></div>
    <div className="appTopActions">
     {isAdmin&&<Link href="/admin" className="adminReturnBtn"><span>↔</span> Return to Admin</Link>}
     <Link href="/transfers" className="ghostBtn">Add money</Link>
     <Link href="/support" className="iconBtn"><Icon name="chat"/></Link>
    </div>
   </div>
   {children}
  </main>
 </div>
}
