import { randomUUID } from 'crypto'
import { getDb } from './db'

export type SupportMessage={
  id:string
  userId:string
  userName:string
  email:string
  from:'client'|'team'
  text:string
  createdAt:string
}

declare global {
  var __aetherSupportMessages: SupportMessage[] | undefined
}
function memory(){
  if(!globalThis.__aetherSupportMessages)globalThis.__aetherSupportMessages=[]
  return globalThis.__aetherSupportMessages
}

export async function addSupportMessage(input:Omit<SupportMessage,'id'|'createdAt'>){
  const msg:SupportMessage={...input,id:randomUUID(),createdAt:new Date().toISOString()}
  const db=await getDb()
  if(db)await db.collection('support_messages').insertOne(msg)
  else memory().push(msg)
  return msg
}

export async function userMessages(userId:string){
  const db=await getDb()
  if(db)return await db.collection<SupportMessage>('support_messages').find({userId},{projection:{_id:0}}).sort({createdAt:1}).limit(300).toArray()
  return memory().filter(m=>m.userId===userId)
}

export async function allSupportMessages(){
  const db=await getDb()
  if(db)return await db.collection<SupportMessage>('support_messages').find({},{projection:{_id:0}}).sort({createdAt:-1}).limit(500).toArray()
  return [...memory()].reverse().slice(0,500)
}
