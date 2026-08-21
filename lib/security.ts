export function assertTrustedOrigin(req:Request){
  const origin=req.headers.get('origin')
  if(!origin)return
  const requestOrigin=new URL(req.url).origin
  const appOrigin=process.env.APP_URL ? new URL(process.env.APP_URL).origin : requestOrigin
  if(origin!==requestOrigin && origin!==appOrigin)throw new Error('UNTRUSTED_ORIGIN')
}

export function cleanEmail(value:unknown){
  const email=String(value||'').trim().toLowerCase()
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error('INVALID_EMAIL')
  return email
}
export function cleanText(value:unknown,max=1000){
  return String(value||'').replace(/\u0000/g,'').trim().slice(0,max)
}
