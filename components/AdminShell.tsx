"use client"
import Link from "next/link"
import {usePathname} from "next/navigation"
import Logo from "@/components/Logo"

const nav=[
 ["/admin","Overview","⌂"],
 ["/admin/clients","Clients","👤"],
 ["/admin/markets","Markets & prices","◫"],
 ["/admin/allocations","Allocations","✓"],
 ["/admin/funding","Funding","↕"],
 ["/admin/content","Homepage","✎"],
]
export default function AdminShell({children}:{children:React.ReactNode}){
 const p=usePathname()
 return <div className="adminAppV2">
  <aside className="adminNavV2">
   <div className="adminBrandV2"><Link href="/"><Logo/></Link><span>Administration</span></div>
   <nav>{nav.map(([href,label,icon])=><Link key={href} href={href} className={p===href?"active":""}><span>{icon}</span><b>{label}</b></Link>)}</nav>
   <div className="adminBottomV2">
    <Link href="/dashboard" className="viewClientBtn">↔ View as client</Link>
    <small>Signed in as administrator</small>
   </div>
  </aside>
  <main className="adminContentV2">
   <header className="adminMobileTopV2"><Link href="/admin">Aether Admin</Link><Link href="/dashboard">Client view</Link></header>
   {children}
   <nav className="adminMobileNavV2">{nav.slice(0,5).map(([href,label,icon])=><Link key={href} href={href} className={p===href?"active":""}><span>{icon}</span><small>{label.split(" ")[0]}</small></Link>)}</nav>
  </main>
 </div>
}
