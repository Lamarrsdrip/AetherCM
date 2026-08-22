import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { assertTrustedOrigin } from '@/lib/security'
import { listContactSubmissions, updateContactSubmissionStatus, deleteContactSubmission } from '@/lib/contact'

async function admin(){
  const s=await getSession()
  return s?.role==='admin'
}

export async function GET(){
  if(!await admin())return NextResponse.json({error:'Administrator access required.'},{status:401})
  const submissions=await listContactSubmissions()
  return NextResponse.json({submissions})
}

export async function POST(req:Request){
  if(!await admin())return NextResponse.json({error:'Administrator access required.'},{status:401})
  try{assertTrustedOrigin(req)}catch{return NextResponse.json({error:'Please refresh and try again.'},{status:403})}
  const b=await req.json().catch(()=>({}))
  const id=String(b.id||'')
  if(!id)return NextResponse.json({error:'Missing submission id.'},{status:400})

  if(b.action==='delete'){
    await deleteContactSubmission(id)
    return NextResponse.json({ok:true})
  }
  const statusMap:Record<string,'read'|'resolved'|'archived'>={'mark-read':'read','mark-resolved':'resolved','archive':'archived'}
  const status=statusMap[b.action]
  if(!status)return NextResponse.json({error:'Unknown action.'},{status:400})
  await updateContactSubmissionStatus(id,status)
  return NextResponse.json({ok:true})
}
