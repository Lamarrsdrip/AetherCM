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
   <div className="adminBrandV2">
    <Link href="/"><Logo/></Link>
    <span>Administration</span>
   </div>

   <Link href="/dashboard" className="viewClientBtn viewClientPrimary">
    <span>👤</span>
    <div><b>View as Client</b><small>Open the client app</small></div>
    <span>→</span>
   </Link>

   <nav>
    {nav.map(([href,label,icon])=><Link key={href} href={href} className={p===href?"active":""}><span>{icon}</span><b>{label}</b></Link>)}
   </nav>

   <div className="adminBottomV2">
    <small>Signed in as administrator</small>
   </div>
  </aside>

  <main className="adminContentV2">
   <header className="adminMobileTopV2">
    <Link href="/admin">Aether Admin</Link>
    <Link href="/dashboard" className="mobileClientSwitch">👤 Client view</Link>
   </header>

   {children}

   <nav className="adminMobileNavV2">
    {nav.slice(0,4).map(([href,label,icon])=><Link key={href} href={href} className={p===href?"active":""}><span>{icon}</span><small>{label.split(" ")[0]}</small></Link>)}
    <Link href="/dashboard" className="mobileClientNavItem"><span>👤</span><small>Client</small></Link>
   </nav>
  </main>
 </div>
}
