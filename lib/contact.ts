import { randomUUID } from 'crypto'
import { getDb } from './db'

export type ContactSubmissionStatus='new'|'read'|'resolved'|'archived'
export type ContactSubmission={
  id:string
  name:string
  email:string
  phone?:string
  subject:string
  message:string
  status:ContactSubmissionStatus
  createdAt:string
}

declare global {
  var __aetherContactSubmissions: ContactSubmission[] | undefined
}
function memory(){
  if(!globalThis.__aetherContactSubmissions)globalThis.__aetherContactSubmissions=[]
  return globalThis.__aetherContactSubmissions
}

export async function addContactSubmission(input:Omit<ContactSubmission,'id'|'createdAt'|'status'>){
  const submission:ContactSubmission={...input,id:randomUUID(),status:'new',createdAt:new Date().toISOString()}
  const db=await getDb()
  if(db)await db.collection('contact_submissions').insertOne(submission)
  else memory().unshift(submission)
  return submission
}

export async function listContactSubmissions(){
  const db=await getDb()
  if(db)return await db.collection<ContactSubmission>('contact_submissions').find({},{projection:{_id:0}}).sort({createdAt:-1}).limit(500).toArray()
  return memory().slice(0,500)
}

export async function updateContactSubmissionStatus(id:string,status:ContactSubmissionStatus){
  const db=await getDb()
  if(db){
    const r=await db.collection('contact_submissions').updateOne({id},{$set:{status}})
    return r.matchedCount>0
  }
  const row=memory().find(m=>m.id===id)
  if(!row)return false
  row.status=status
  return true
}

export async function deleteContactSubmission(id:string){
  const db=await getDb()
  if(db){
    const r=await db.collection('contact_submissions').deleteOne({id})
    return r.deletedCount>0
  }
  const idx=memory().findIndex(m=>m.id===id)
  if(idx===-1)return false
  memory().splice(idx,1)
  return true
}
