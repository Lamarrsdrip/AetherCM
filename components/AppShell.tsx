'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from './Logo'
import { Icon } from './Icons'

const links=[['/dashboard','Overview','spark'],['/portfolio','Portfolio','wallet'],['/markets','Markets','trend'],['/transfers','Money','plus'],['/support','Support','chat']]
export default function AppShell({children}:{children:React.ReactNode}){
 const path=usePathname()
 return <div className="appFrame">
  <aside className="appSide"><Link href="/dashboard"><Logo/></Link><div className="sideLinks">{links.map(([href,label,icon])=><Link key={href} className={path===href?'active':''} href={href}><Icon name={icon}/><span>{label}</span></Link>)}</div><div className="sideFoot"><span className="avatar">AG</span><div><b>Aether Client</b><small>Individual account</small></div></div></aside>
  <main className="appMain"><div className="appTop"><div><small>Aether Capital Markets</small><b>Private investing workspace</b></div><div className="appTopActions"><Link href="/transfers" className="ghostBtn">Add money</Link><Link href="/support" className="iconBtn"><Icon name="chat"/></Link></div></div>{children}</main>
 </div>
}
