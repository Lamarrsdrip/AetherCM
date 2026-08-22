import nodemailer from 'nodemailer'
import { loadState } from './store'

export async function emailStatus(){
  const state=await loadState()
  const gmail=Boolean(state.emailConfig.enabled && state.emailConfig.gmailAddress && state.emailConfig.appPassword)
  if(gmail)return {configured:true,provider:'Gmail'}
  const resend=Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM)
  if(resend)return {configured:true,provider:'Resend'}
  const smtp=Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.EMAIL_FROM)
  if(smtp)return {configured:true,provider:'SMTP'}
  return {configured:false,provider:'Not connected'}
}

function esc(s:string){
  return s.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]||m))
}

export async function sendEmail(opts:{to:string;subject:string;text:string;title?:string}){
  const html=`<!doctype html><html><body style="margin:0;background:#f5f7f5;font-family:Arial,sans-serif;color:#172019">
  <div style="max-width:620px;margin:0 auto;padding:34px 18px">
    <div style="font-size:22px;font-weight:700;margin-bottom:24px">Aether Capital Markets</div>
    <div style="background:#fff;border:1px solid #e1e7e2;border-radius:18px;padding:28px">
      <h1 style="font-family:Georgia,serif;font-size:30px;font-weight:500;margin:0 0 14px">${esc(opts.title||opts.subject)}</h1>
      <p style="font-size:15px;line-height:1.65;color:#556159;white-space:pre-line">${esc(opts.text)}</p>
    </div>
    <p style="font-size:11px;color:#89938d;margin-top:20px">This message relates to your Aether account.</p>
  </div></body></html>`

  const state=await loadState()
  const gmail=state.emailConfig
  if(gmail.enabled && gmail.gmailAddress && gmail.appPassword){
    const from=`${gmail.fromName||'Aether Capital Markets'} <${gmail.gmailAddress}>`
    try{
      const transporter=nodemailer.createTransport({
        host:'smtp.gmail.com',port:465,secure:true,
        auth:{user:gmail.gmailAddress,pass:gmail.appPassword}
      })
      await transporter.sendMail({from,to:opts.to,subject:opts.subject,text:opts.text,html})
      return {sent:true}
    }catch(e:any){
      return {sent:false,reason:`gmail-${e?.responseCode||e?.code||'error'}`}
    }
  }

  const from=process.env.EMAIL_FROM
  if(!from)return {sent:false,reason:'not-configured'}

  if(process.env.RESEND_API_KEY){
    const r=await fetch('https://api.resend.com/emails',{
      method:'POST',
      headers:{'authorization':`Bearer ${process.env.RESEND_API_KEY}`,'content-type':'application/json'},
      body:JSON.stringify({from,to:opts.to,subject:opts.subject,html,text:opts.text})
    })
    if(!r.ok)return {sent:false,reason:`email-provider-${r.status}`}
    return {sent:true}
  }

  if(process.env.SMTP_HOST&&process.env.SMTP_USER&&process.env.SMTP_PASS){
    const transporter=nodemailer.createTransport({
      host:process.env.SMTP_HOST,
      port:Number(process.env.SMTP_PORT||587),
      secure:String(process.env.SMTP_SECURE||'false')==='true',
      auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}
    })
    await transporter.sendMail({from,to:opts.to,subject:opts.subject,text:opts.text,html})
    return {sent:true}
  }

  return {sent:false,reason:'not-configured'}
}
