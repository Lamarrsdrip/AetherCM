import { NextResponse } from 'next/server'
import { assertTrustedOrigin, cleanEmail, cleanText } from '@/lib/security'
import { addContactSubmission } from '@/lib/contact'
import { createNotice } from '@/lib/notify'
import { sendEmail } from '@/lib/email'

export async function POST(req:Request){
  try{assertTrustedOrigin(req)}catch{return NextResponse.json({error:'Please refresh and try again.'},{status:403})}
  const b=await req.json().catch(()=>({}))

  const name=cleanText(b.name,120)
  const subject=cleanText(b.subject,160)
  const message=cleanText(b.message,4000)
  const phone=cleanText(b.phone,40)
  let email:string
  try{email=cleanEmail(b.email)}catch{return NextResponse.json({error:'Enter a valid email address.'},{status:400})}
  if(!name||!subject||!message)return NextResponse.json({error:'Please complete all required fields.'},{status:400})

  const submission=await addContactSubmission({name,email,phone:phone||undefined,subject,message})

  await createNotice({userId:'__admin__',title:'New contact message',body:`${name} sent a message: ${subject}`,href:'/admin/contact'}).catch(()=>{})
  if(process.env.SUPPORT_EMAIL){
    await sendEmail({
      to:process.env.SUPPORT_EMAIL,
      subject:`New contact message: ${subject}`,
      title:'New contact message',
      text:`From: ${name} <${email}>${phone?`\nPhone: ${phone}`:''}\n\n${message}`
    }).catch(()=>{})
  }

  return NextResponse.json({ok:true})
}
