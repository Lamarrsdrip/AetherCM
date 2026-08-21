import { createHash, randomBytes } from 'crypto'
import { getDb } from './db'

type Credential = {
  email:string
  userId:string
  passwordHash:string
  createdAt:Date
  updatedAt:Date
}

declare global {
  var __aetherCredentials: Map<string,Credential> | undefined
  var __aetherResets: Map<string,{email:string,expiresAt:number}> | undefined
}

function memoryCreds(){
  if(!globalThis.__aetherCredentials) globalThis.__aetherCredentials=new Map()
  return globalThis.__aetherCredentials
}
function memoryResets(){
  if(!globalThis.__aetherResets) globalThis.__aetherResets=new Map()
  return globalThis.__aetherResets
}
const hash=(v:string)=>createHash('sha256').update(v).digest('hex')

export async function getCredential(email:string):Promise<Credential|null>{
  const clean=email.toLowerCase()
  const db=await getDb()
  if(!db)return memoryCreds().get(clean)||null
  return await db.collection<Credential>('credentials').findOne({email:clean},{projection:{_id:0}})
}

export async function createCredential(email:string,userId:string,passwordHash:string){
  const clean=email.toLowerCase(), now=new Date()
  const db=await getDb()
  if(!db){
    if(memoryCreds().has(clean))throw new Error('ACCOUNT_EXISTS')
    memoryCreds().set(clean,{email:clean,userId,passwordHash,createdAt:now,updatedAt:now})
    return
  }
  await db.collection('credentials').createIndex({email:1},{unique:true})
  try{
    await db.collection('credentials').insertOne({email:clean,userId,passwordHash,createdAt:now,updatedAt:now})
  }catch(e:any){
    if(e?.code===11000)throw new Error('ACCOUNT_EXISTS')
    throw e
  }
}

export async function updatePassword(email:string,passwordHash:string){
  const clean=email.toLowerCase(), db=await getDb()
  if(!db){
    const c=memoryCreds().get(clean)
    if(!c)return false
    memoryCreds().set(clean,{...c,passwordHash,updatedAt:new Date()})
    return true
  }
  const r=await db.collection('credentials').updateOne({email:clean},{$set:{passwordHash,updatedAt:new Date()}})
  return r.matchedCount>0
}

export async function createPasswordReset(email:string){
  const token=randomBytes(32).toString('hex')
  const tokenHash=hash(token)
  const expiresAt=Date.now()+30*60*1000
  const db=await getDb()
  if(!db){
    memoryResets().set(tokenHash,{email:email.toLowerCase(),expiresAt})
  }else{
    await db.collection('password_resets').deleteMany({email:email.toLowerCase()})
    await db.collection('password_resets').insertOne({
      tokenHash,email:email.toLowerCase(),expiresAt:new Date(expiresAt),createdAt:new Date()
    })
    await db.collection('password_resets').createIndex({expiresAt:1},{expireAfterSeconds:0})
  }
  return token
}

export async function consumePasswordReset(token:string){
  const tokenHash=hash(token), db=await getDb()
  if(!db){
    const row=memoryResets().get(tokenHash)
    if(!row||row.expiresAt<Date.now())return null
    memoryResets().delete(tokenHash)
    return row.email
  }
  const row=await db.collection('password_resets').findOneAndDelete({tokenHash,expiresAt:{$gt:new Date()}})
  return (row as any)?.email || null
}
