import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'
import Logo from '@/components/Logo'
import {Icon} from '@/components/Icons'
import AssetLogo from '@/components/AssetLogo'
import ContactForm from '@/components/ContactForm'
import {loadState} from '@/lib/store'
export const dynamic='force-dynamic'

const img=(id:string)=>`https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`
const homePhotos={
 relationship:{src:img('photo-1758518727477-3885839edee7'),alt:'Smiling colleagues meeting together in a modern office'},
 funding:{src:img('photo-1563986768817-257bf91c5753'),alt:'Client smiling while reviewing their account on a phone'},
 support:{src:img('photo-1714079761488-e0c9b9ac4138'),alt:'Aether support specialist smiling while assisting a client'},
}

export default async function Home(){
 const state=await loadState()
 const c=state.siteContent
 const company=state.companyProfile
 const social=state.socialLinks
 const assets=state.shareControls.filter(x=>x.enabled).slice(0,6)
 const methods=state.fundingMethods.filter(m=>m.enabled)
 const contact=c.contact

 return <div className="marketingPage"><SiteHeader/>

 <section className="hero fidelityHeroV2"><div className="heroGrid"><div className="heroCopy"><span className="eyebrow">{c.eyebrow}</span><h1>{c.heroTitle}<br/><em>{c.heroAccent}</em></h1><p>{c.heroBody}</p><div className="heroActions"><Link className="solidBtn" href="/register">Open an account <Icon name="arrow" size={18}/></Link><Link className="outlineBtn signInHeroBtn" href="/login">Already a client? Sign in</Link></div><div className="trustLine"><span><Icon name="shield" size={17}/> Secure account access</span><span>•</span><span>Human support</span></div></div><div className="dashboardShowcaseV2"><div className="mockAppTopV2"><Logo/><span>Private account</span></div><div className="mockBalanceV2"><small>Total account value</small><b>$0.00</b><span>New accounts begin at zero</span></div><div className="mockStatsV2"><div><small>Available cash</small><b>$0.00</b></div><div><small>Invested</small><b>$0.00</b></div><div><small>Today</small><b>—</b></div></div><div className="mockListV2"><div><span>AAPL</span><small>Apple</small><b>Available</b></div><div><span>NVDA</span><small>NVIDIA</small><b>Available</b></div><div><span>VTI</span><small>Total Stock Market ETF</small><b>Available</b></div></div><div className="mockBottomV2"><span>Portfolio</span><span>Markets</span><span>Money</span><span>Support</span></div></div></div></section>

 <section className="section imageSplitSection relationshipSection">
  <img className="imageSplitMedia" src={homePhotos.relationship.src} alt={homePhotos.relationship.alt} loading="lazy"/>
  <div className="imageSplitCopy"><span className="eyebrow">Client relationship</span><h2>{c.trustTitle}</h2><p>{c.trustBody}</p></div>
 </section>

 <section className="appComingSoon"><div className="appSoonCopy"><span className="eyebrow">Aether mobile</span><h2>Your account, wherever you are.</h2><p>Aether Capital Markets for iPhone and Android is coming soon. Until launch, the web app is fully optimized for mobile and can be added to your home screen.</p><div className="comingBadges"><div><span>iOS</span><small>Coming soon on</small><b>App Store</b></div><div><span>Play</span><small>Coming soon on</small><b>Google Play</b></div></div></div><div className="appSoonPhone"><div className="phoneTop"><b>Aether</b><span>...</span></div><small>Account value</small><strong>$0.00</strong><div className="phoneMiniStats"><div><small>Portfolio</small><b>Ready</b></div><div><small>Support</small><b>24/7 access</b></div></div><div className="phoneNav"><span>Overview</span><span>Markets</span><span>Money</span></div></div></section>

 <section className="quietStrip"><div><span>One account</span><b>Across the way you build wealth.</b></div><div className="stripItems"><span>Shares</span><span>ETFs</span><span>Cash</span><span>Crypto funding</span><span>Support</span></div></section>

 <section className="section objectiveIntro" id="objectives"><div className="sectionHead"><span className="eyebrow">What Aether offers</span><h2>{c.objectiveTitle}</h2><p>{c.objectiveBody}</p></div><div className="homeOfferGrid">{c.offers.map((o,i)=><article className={`homeOfferCard offer${i+1}`} key={o.id}><span className="cardNum">0{i+1}</span><span className="eyebrow">{o.kicker}</span><h3>{o.title}</h3><p>{o.body}</p><Link href={o.href}>{o.cta} <Icon name="arrow" size={16}/></Link></article>)}</div></section>

 <section className="section marketsPreviewSection"><div className="sectionHead"><span className="eyebrow">Markets</span><h2>Shares and ETFs, ready to invest in.</h2><p>A growing catalog of leading companies and diversified funds, priced transparently on Aether.</p></div>
  <div className="homeMarketsGrid">{assets.map(a=><Link className="homeMarketCard" href="/markets" key={a.symbol}><AssetLogo symbol={a.symbol} logoUrl={a.logoUrl} assetType={a.assetType}/><div><b>{a.symbol}</b><small>{a.name}</small></div><span className="assetTypeBadge">{a.assetType}</span></Link>)}</div>
  <Link className="outlineBtn" href="/markets">View all markets <Icon name="arrow" size={16}/></Link>
 </section>

 <section className="section imageSplitSection fundingSection reverse">
  <img className="imageSplitMedia" src={homePhotos.funding.src} alt={homePhotos.funding.alt} loading="lazy"/>
  <div className="imageSplitCopy"><span className="eyebrow">Funding methods</span><h2>Crypto, bank transfer or PayPal — you choose.</h2><p>Every deposit and withdrawal is tracked from request to completion, so you always know where your money stands.</p>
   <div className="fundingMethodChips">{methods.map(m=><span key={m.id}>{m.label}</span>)}</div>
   <Link className="outlineBtn" href="/register">Get started <Icon name="arrow" size={16}/></Link>
  </div>
 </section>

 <section className="section imageSplitSection supportSection">
  <img className="imageSplitMedia" src={homePhotos.support.src} alt={homePhotos.support.alt} loading="lazy"/>
  <div className="imageSplitCopy"><span className="eyebrow">Client service</span><h2>A real person, not a queue.</h2><p>Live chat connects you directly to our support team for anything about your account, a transfer or an investment.</p><Link className="outlineBtn" href="/support">Get support <Icon name="arrow" size={16}/></Link></div>
 </section>

 <section className="section ctaBandSection"><div className="ctaBand"><div><span className="eyebrow">Aether Capital Markets</span><h2>A clearer way to manage capital.</h2><p>Open an account and build your financial home.</p></div><Link className="solidBtn light" href="/register">Get started <Icon name="arrow" size={18}/></Link></div></section>

 <section className="section contactSection" id="contact"><div className="sectionHead"><span className="eyebrow">Contact</span><h2>{contact.heading}</h2><p>{contact.description}</p></div>
  <div className="contactLayoutV2">
   <div className="contactInfoV2">
    {contact.showAddress&&(company.addressLine1||company.city)&&<div><b>Address</b><span>{company.addressLine1}{company.addressLine2?`, ${company.addressLine2}`:''}{company.city?`, ${company.city}`:''}{company.country?`, ${company.country}`:''}</span></div>}
    {contact.showEmails&&(company.supportEmail||company.generalEmail)&&<div><b>Email</b>{company.supportEmail&&<span>Support: {company.supportEmail}</span>}{company.generalEmail&&<span>General: {company.generalEmail}</span>}</div>}
    {contact.showPhone&&company.phone&&<div><b>Phone</b><span>{company.phone}</span></div>}
    {contact.showWhatsapp&&company.whatsapp&&<div><b>WhatsApp</b><span>{company.whatsapp}</span></div>}
    {contact.showBusinessHours&&company.businessHours&&<div><b>Business hours</b><span>{company.businessHours}</span></div>}
   </div>
   <ContactForm/>
  </div>
 </section>

 <footer className="footer"><div><Logo/><p>{company.description||'Investing, money movement and client support in one place.'}</p></div><div><b>Platform</b><Link href="/login">Markets</Link><Link href="/login">Portfolio</Link><Link href="/support">Support</Link></div><div><b>Company</b><a href="#objectives">About</a><a href="#contact">Contact</a><a>Disclosures</a></div>
  {(social.twitter||social.instagram||social.linkedin||social.facebook)&&<div><b>Follow</b>{social.twitter&&<a href={social.twitter} target="_blank" rel="noreferrer">X / Twitter</a>}{social.instagram&&<a href={social.instagram} target="_blank" rel="noreferrer">Instagram</a>}{social.linkedin&&<a href={social.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}{social.facebook&&<a href={social.facebook} target="_blank" rel="noreferrer">Facebook</a>}</div>}
  <div className="footerLegal">Availability of investment and payment services may vary by account eligibility and jurisdiction. Review the terms shown for your account before making a decision.{company.registrationNumber?` ${company.name} · Registration No. ${company.registrationNumber}.`:''}</div>
 </footer></div>
}
