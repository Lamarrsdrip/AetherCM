"use client"
import Link from 'next/link'
import {useEffect,useState} from 'react'
import {usePathname} from 'next/navigation'
import Logo from './Logo'
import {Icon} from './Icons'
import NotificationCenter from './NotificationCenter'

const links=[['/dashboard','Overview','spark'],['/portfolio','Portfolio','wallet'],['/markets','Markets','trend'],['/transfers','Money','plus'],['/support','Support','chat']]
type Session={role:'admin'|'client';email:string;userId:string}|null

export default function AppShell({children}:{children:React.ReactNode}){
 const path=usePathname(),[session,setSession]=useState<Session>(null)
 useEffect(()=>{fetch('/api/auth/session',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(d=>setSession(d?.session||null)).catch(()=>setSession(null))},[])
 const isAdmin=session?.role==='admin'
 return <div className="appFrame responsiveAppFrame">
  <aside className="appSide"><Link href="/dashboard"><Logo/></Link><div className="sideLinks">{links.map(([href,label,icon])=><Link key={href} className={path===href?'active':''} href={href}><Icon name={icon}/><span>{label}</span></Link>)}</div>{isAdmin&&<Link href="/admin" className="sideAdminSwitch"><span className="shieldMark">A</span><div><b>Admin Console</b><small>Return to administration</small></div><span>→</span></Link>}<div className="sideFoot"><span className="avatar">{isAdmin?'AD':'AC'}</span><div><b>{isAdmin?'Aether Administrator':'Aether Client'}</b><small>{isAdmin?'Viewing client app':'Individual account'}</small></div></div></aside>
  <main className="appMain"><div className="appTop"><div className="appTopIdentity"><small>Aether Capital Markets</small><b>{isAdmin?'Client view · administrator session':'Private investing workspace'}</b></div><div className="appTopActions">{isAdmin&&<Link href="/admin" className="adminConsoleBtn"><span>🛡</span> Admin Console</Link>}<NotificationCenter/><Link href="/transfers" className="topMoneyBtn">Add money</Link></div></div>{isAdmin&&<div className="adminModeBanner"><span>Administrator client view</span><b>You are viewing the app as a client.</b><Link href="/admin">Return to Admin →</Link></div>}<div className="appContentViewport">{children}</div></main>
  <nav className="clientMobileNav">{links.map(([href,label,icon])=><Link key={href} className={path===href?'active':''} href={href}><Icon name={icon}/><small>{label}</small></Link>)}{isAdmin&&<Link href="/admin" className="mobileAdminShortcut"><span>🛡</span><small>Admin</small></Link>}</nav>
 </div>
}
