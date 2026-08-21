import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { assertTrustedOrigin, cleanText } from '@/lib/security'
import { loadState, ensureAccount } from '@/lib/store'
import { addSupportMessage, userMessages } from '@/lib/support'
import { createNotice } from '@/lib/notify'
import { sendEmail } from '@/lib/email'

export async function GET(){
  const session=await getSession()
  if(!session)return NextResponse.json({error:'Please sign in.'},{status:401})
  return NextResponse.json({messages:await userMessages(session.userId)})
}

export async function POST(req:Request){
  const session=await getSession()
  if(!session)return NextResponse.json({error:'Please sign in.'},{status:401})
  try{assertTrustedOrigin(req)}catch{return NextResponse.json({error:'Please refresh and try again.'},{status:403})}
  const b=await req.json().catch(()=>({})),text=cleanText(b.text,1500)
  if(text.length<1)return NextResponse.json({error:'Write a message first.'},{status:400})
  const state=await loadState(),account=ensureAccount(state,session.email)
  const message=await addSupportMessage({userId:account.id,userName:account.name,email:account.email,from:'client',text})
  await createNotice({userId:'__admin__',title:'New support message',body:`${account.name} sent a support message.`,href:'/admin/support'}).catch(()=>{})
  if(process.env.SUPPORT_EMAIL)await sendEmail({to:process.env.SUPPORT_EMAIL,subject:'New Aether support message',title:'New support message',text:`${account.name} (${account.email}) wrote:\n\n${text}`}).catch(()=>{})
  return NextResponse.json({ok:true,message})
}
