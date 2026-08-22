import { randomUUID } from 'crypto'
import { getDb } from './db'
import { sendEmail } from './email'
import { sendPush } from './push'

export type Notice={
  id:string
  userId:string
  title:string
  body:string
  href:string
  read:boolean
  createdAt:string
}

declare global {
  var __aetherNotices: Notice[] | undefined
}

function memory(){
  if(!globalThis.__aetherNotices)globalThis.__aetherNotices=[]
  return globalThis.__aetherNotices
}

export async function createNotice(opts:{userId:string;title:string;body:string;href?:string;email?:string;sendPush?:boolean;sendEmailNotice?:boolean}){
  const notice:Notice={
    id:randomUUID(),userId:opts.userId,title:opts.title,body:opts.body,
    href:opts.href||'/dashboard',read:false,createdAt:new Date().toISOString()
  }
  const db=await getDb()
  if(db)await db.collection('notifications').insertOne(notice)
  else memory().unshift(notice)

  if(opts.sendPush!==false)await sendPush(opts.userId,{title:opts.title,body:opts.body,url:notice.href}).catch(()=>{})
  if(opts.sendEmailNotice!==false && opts.email)await sendEmail({to:opts.email,subject:opts.title,title:opts.title,text:opts.body}).catch(()=>{})
  return notice
}

export async function listNotices(userId:string){
  const db=await getDb()
  if(db)return await db.collection<Notice>('notifications').find({userId},{projection:{_id:0}}).sort({createdAt:-1}).limit(30).toArray()
  return memory().filter(n=>n.userId===userId).slice(0,30)
}

export async function markNoticeRead(userId:string,id?:string){
  const db=await getDb()
  if(db){
    await db.collection('notifications').updateMany(
      id?{userId,id}:{userId},
      {$set:{read:true}}
    )
  }else{
    for(const n of memory())if(n.userId===userId&&(!id||n.id===id))n.read=true
  }
}
