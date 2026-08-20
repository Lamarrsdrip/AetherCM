import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'
import Logo from '@/components/Logo'
import { Icon } from '@/components/Icons'

const products=[
 ['Invest','Stocks, ETFs, bonds and digital assets in one focused experience.'],
 ['Build','Long-term portfolios with recurring investments and goal tracking.'],
 ['Plan','Cash, retirement and wealth tools designed around your timeline.']
]

export default function Home(){
 return <div className="marketingPage"><SiteHeader/>
  <section className="hero"><div className="heroGrid">
   <div className="heroCopy"><span className="eyebrow">A modern capital markets platform</span><h1>Your capital.<br/>More <em>clarity.</em></h1><p>Invest, manage cash and build long-term wealth from one private, beautifully simple workspace.</p><div className="heroActions"><Link className="solidBtn" href="/register">Open an account <Icon name="arrow" size={18}/></Link><Link className="outlineBtn" href="/dashboard">Explore the experience</Link></div><div className="trustLine"><span><Icon name="shield" size={17}/> Security-first architecture</span><span>•</span><span>Human support when you need it</span></div></div>
   <div className="heroObject"><div className="wealthCard"><div className="wealthTop"><span>Portfolio value</span><b>$123,305.90</b><small>+$10,331.90 all time</small></div><div className="miniRows"><div><span>Buying power</span><b>$18,420.44</b></div><div><span>Invested</span><b>$104,885.46</b></div><div><span>Today</span><b className="good">+$1,284.11</b></div></div></div><div className="floatCard"><span>Next recurring investment</span><b>$2,500</b><small>Friday · Balanced portfolio</small></div></div>
  </div></section>

  <section className="quietStrip"><div><span>One account</span><b>Across the way you build wealth.</b></div><div className="stripItems"><span>Equities</span><span>ETFs</span><span>Fixed income</span><span>Crypto</span><span>Cash</span></div></section>

  <section className="section" id="wealth"><div className="sectionHead"><span className="eyebrow">Built around you</span><h2>Less financial noise.<br/>More useful decisions.</h2><p>Aether brings the important parts forward and leaves the clutter behind.</p></div><div className="productGrid">{products.map(([t,d],i)=><article className="productCard" key={t}><span className="cardNum">0{i+1}</span><h3>{t}</h3><p>{d}</p><Link href="/dashboard">Explore <Icon name="arrow" size={17}/></Link></article>)}</div></section>

  <section className="section splitSection"><div className="splitCopy"><span className="eyebrow">Private client experience</span><h2>A serious dashboard that still feels simple.</h2><p>Your portfolio, cash, activity and market access are organized around what deserves attention now—not around endless menus.</p><ul className="cleanList"><li>Consolidated portfolio overview</li><li>Real-time account activity</li><li>Transfer and withdrawal controls</li><li>Human live support</li></ul><Link className="outlineBtn" href="/dashboard">See the dashboard</Link></div><div className="dashboardPreview"><div className="previewBar"><Logo/><span>Private account</span></div><div className="previewBalance"><small>Total portfolio</small><b>$123,305.90</b><span className="good">+$1,284.11 today</span></div><div className="previewCols"><div><small>Invested</small><b>$104,885</b></div><div><small>Cash</small><b>$18,420</b></div><div><small>Return</small><b>+9.14%</b></div></div><div className="previewTable"><span>SPY <b>$48,240</b></span><span>NVDA <b>$28,750</b></span><span>AAPL <b>$19,780</b></span></div></div></section>

  <section className="section" id="learn"><div className="ctaBand"><div><span className="eyebrow">Aether Capital Markets</span><h2>Start with a clearer financial home.</h2><p>Create your account and explore the product experience.</p></div><Link className="solidBtn light" href="/register">Get started <Icon name="arrow" size={18}/></Link></div></section>

  <footer className="footer"><div><Logo/><p>Modern investing and private client software.</p></div><div><b>Platform</b><Link href="/markets">Markets</Link><Link href="/portfolio">Portfolio</Link><Link href="/support">Support</Link></div><div><b>Company</b><a>About</a><a>Security</a><a>Disclosures</a></div><div className="footerLegal">Aether Capital Markets is a software prototype. Brokerage, custody, securities execution and regulated financial services require appropriate licensing and regulated partners before production launch.</div></footer>
 </div>
}
