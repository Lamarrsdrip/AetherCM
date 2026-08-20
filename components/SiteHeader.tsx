import Link from 'next/link'
import Logo from './Logo'
import { Icon } from './Icons'

export default function SiteHeader(){
 return <header className="siteHeader"><div className="headerInner">
  <Link href="/" className="brandLink"><Logo/></Link>
  <nav className="desktopNav">
   <Link href="/markets">Markets</Link><Link href="/portfolio">Investing</Link><Link href="/#wealth">Wealth</Link><Link href="/#learn">Learn</Link><Link href="/support">Support</Link>
  </nav>
  <div className="headerActions"><Link className="textBtn" href="/login">Log in</Link><Link className="solidBtn small" href="/register">Open account</Link><button className="iconBtn mobileOnly"><Icon name="menu"/></button></div>
 </div></header>
}
