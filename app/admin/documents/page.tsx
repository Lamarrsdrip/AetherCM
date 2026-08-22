"use client"
import {useEffect,useState} from "react"
import AdminShell from "@/components/AdminShell"
export default function DocumentsAdmin(){
 const[doc,setDoc]=useState<any>(null),[docStatus,setDocStatus]=useState(""),[uploading,setUploading]=useState(false)
 const loadDoc=()=>fetch("/api/admin/client-document",{cache:"no-store"}).then(r=>r.json()).then(d=>setDoc(d.document||null))
 useEffect(()=>{loadDoc()},[])
 const uploadPdf=async(e:React.ChangeEvent<HTMLInputElement>)=>{const f=e.target.files?.[0];if(!f)return;setUploading(true);setDocStatus("");const fd=new FormData();fd.append("file",f);const r=await fetch("/api/admin/client-document",{method:"POST",body:fd});const d=await r.json().catch(()=>({}));if(!r.ok)setDocStatus(d.error||"Upload failed.");else{setDoc(d.document);setDocStatus("PDF updated successfully.")}setUploading(false);e.target.value=""}
 return <AdminShell><section className="adminPageV2">
  <div className="pageHeadV2"><div><span>Documents</span><h1>Client documents</h1><p>Manage the documents clients can view and download.</p></div></div>
  <section className="adminSectionCardV2 clientPdfAdminCard"><div className="sectionTitleV2"><div><h2>Client Relationship Summary</h2><p>Upload the PDF clients see and download from their Overview page.</p></div></div><div className="pdfAdminBody"><div className="pdfAdminStatus"><div className="pdfAdminIcon">PDF</div><div><small>Current document</small><b>{doc?.filename||"Default AetherCM relationship summary"}</b><span>{doc?.uploadedAt?`Last updated ${new Date(doc.uploadedAt).toLocaleString('en-US')}`:"The built-in PDF is currently active."}</span></div></div><div className="pdfAdminActions"><label className="adminPrimaryV2 uploadPdfBtn">{uploading?"Uploading...":"Upload new PDF"}<input type="file" accept="application/pdf" onChange={uploadPdf} disabled={uploading}/></label><a className="adminSecondaryV2" href="/api/client-document" target="_blank" rel="noreferrer">Preview current PDF</a></div><p className="pdfAdminHint">Maximum 10 MB. Uploading a new PDF automatically makes it the document all clients see.</p>{docStatus&&<div className="pdfAdminMessage">{docStatus}</div>}</div></section>
 </section></AdminShell>
}
