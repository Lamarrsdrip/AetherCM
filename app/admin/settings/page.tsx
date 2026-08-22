"use client"
import {useEffect,useState} from "react"
import AdminShell from "@/components/AdminShell"
type Tab="Company"|"Contact"|"Social"

export default function SettingsAdmin(){
 const[ops,setOps]=useState<any>(null),[tab,setTab]=useState<Tab>("Company"),[saved,setSaved]=useState(false)
 useEffect(()=>{fetch("/api/admin/operations").then(r=>r.json()).then(setOps)},[])
 const save=async()=>{
  const r=await fetch("/api/admin/operations",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"company-profile",patch:ops.companyProfile})})
  const r2=await fetch("/api/admin/operations",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"social-links",patch:ops.socialLinks})})
  if(r.ok&&r2.ok){setOps(await r2.json());setSaved(true);setTimeout(()=>setSaved(false),1700)}
 }
 const cp=(k:string,v:string)=>setOps({...ops,companyProfile:{...ops.companyProfile,[k]:v}})
 const sl=(k:string,v:string)=>setOps({...ops,socialLinks:{...ops.socialLinks,[k]:v}})
 if(!ops)return <AdminShell><section className="adminPageV2">Loading...</section></AdminShell>
 return <AdminShell><section className="adminPageV2">
  <div className="pageHeadV2"><div><span>Administration</span><h1>Settings</h1><p>Company profile, contact details and social links used across the platform.</p></div><button className="adminPrimaryV2" onClick={save}>{saved?"Saved":"Save settings"}</button></div>
  <div className="settingsTabsV2">{(["Company","Contact","Social"] as Tab[]).map(t=><button key={t} className={tab===t?"active":""} onClick={()=>setTab(t)}>{t}</button>)}</div>

  {tab==="Company"&&<section className="adminSectionCardV2"><div className="sectionTitleV2"><div><h2>Company profile</h2><p>Basic identity shown across the platform.</p></div></div>
   <div className="contentFormV2">
    <label>Company name<input value={ops.companyProfile.name} onChange={e=>cp("name",e.target.value)}/></label>
    <label className="wideV2">Short description<textarea value={ops.companyProfile.description} onChange={e=>cp("description",e.target.value)}/></label>
    <label>Address line 1<input value={ops.companyProfile.addressLine1} onChange={e=>cp("addressLine1",e.target.value)}/></label>
    <label>Address line 2 (optional)<input value={ops.companyProfile.addressLine2||""} onChange={e=>cp("addressLine2",e.target.value)}/></label>
    <label>City<input value={ops.companyProfile.city} onChange={e=>cp("city",e.target.value)}/></label>
    <label>Country<input value={ops.companyProfile.country} onChange={e=>cp("country",e.target.value)}/></label>
    <label>Registration number (optional)<input value={ops.companyProfile.registrationNumber||""} onChange={e=>cp("registrationNumber",e.target.value)}/></label>
   </div>
  </section>}

  {tab==="Contact"&&<section className="adminSectionCardV2"><div className="sectionTitleV2"><div><h2>Contact details</h2><p>Used on the homepage contact section and footer.</p></div></div>
   <div className="contentFormV2">
    <label>Support email<input value={ops.companyProfile.supportEmail} onChange={e=>cp("supportEmail",e.target.value)}/></label>
    <label>General email<input value={ops.companyProfile.generalEmail} onChange={e=>cp("generalEmail",e.target.value)}/></label>
    <label>Phone<input value={ops.companyProfile.phone} onChange={e=>cp("phone",e.target.value)}/></label>
    <label>WhatsApp number<input value={ops.companyProfile.whatsapp} onChange={e=>cp("whatsapp",e.target.value)}/></label>
    <label className="wideV2">Business hours<input value={ops.companyProfile.businessHours} onChange={e=>cp("businessHours",e.target.value)}/></label>
   </div>
  </section>}

  {tab==="Social"&&<section className="adminSectionCardV2"><div className="sectionTitleV2"><div><h2>Social & contact links</h2><p>Shown in the homepage footer when set.</p></div></div>
   <div className="contentFormV2">
    <label>X / Twitter<input value={ops.socialLinks.twitter||""} onChange={e=>sl("twitter",e.target.value)}/></label>
    <label>Instagram<input value={ops.socialLinks.instagram||""} onChange={e=>sl("instagram",e.target.value)}/></label>
    <label>LinkedIn<input value={ops.socialLinks.linkedin||""} onChange={e=>sl("linkedin",e.target.value)}/></label>
    <label>Facebook (optional)<input value={ops.socialLinks.facebook||""} onChange={e=>sl("facebook",e.target.value)}/></label>
    <label>WhatsApp link (optional)<input value={ops.socialLinks.whatsappLink||""} onChange={e=>sl("whatsappLink",e.target.value)}/></label>
   </div>
  </section>}
  <button className="adminPrimaryV2 mobileSaveV2" onClick={save}>{saved?"Settings saved":"Save settings"}</button>
 </section></AdminShell>
}
