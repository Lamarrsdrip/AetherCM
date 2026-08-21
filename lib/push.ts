import webpush from 'web-push'
import { getDb } from './db'

type StoredSubscription={
  userId:string
  endpoint:string
  subscription:any
  updatedAt:Date
}

declare global {
  var __aetherPushSubscriptions: Map<string,StoredSubscription> | undefined
}

function memory(){
  if(!globalThis.__aetherPushSubscriptions)globalThis.__aetherPushSubscriptions=new Map()
  return globalThis.__aetherPushSubscriptions
}

export function pushStatus(){
  return {
    configured:Boolean(process.env.VAPID_PUBLIC_KEY&&process.env.VAPID_PRIVATE_KEY&&process.env.VAPID_SUBJECT),
    publicKey:process.env.VAPID_PUBLIC_KEY||''
  }
}

function configure(){
  if(!pushStatus().configured)return false
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )
  return true
}

export async function savePushSubscription(userId:string,subscription:any){
  const endpoint=String(subscription?.endpoint||'')
  if(!endpoint)throw new Error('INVALID_SUBSCRIPTION')
  const row={userId,endpoint,subscription,updatedAt:new Date()}
  const db=await getDb()
  if(!db){
    memory().set(endpoint,row)
    return
  }
  await db.collection('push_subscriptions').updateOne({endpoint},{$set:row},{upsert:true})
  await db.collection('push_subscriptions').createIndex({userId:1})
}

export async function removePushSubscription(userId:string,endpoint:string){
  const db=await getDb()
  if(!db){
    const row=memory().get(endpoint)
    if(row?.userId===userId)memory().delete(endpoint)
    return
  }
  await db.collection('push_subscriptions').deleteOne({userId,endpoint})
}

export async function sendPush(userId:string,payload:{title:string;body:string;url?:string}){
  if(!configure())return {sent:0}
  const db=await getDb()
  const rows:StoredSubscription[]=db
    ? await db.collection<StoredSubscription>('push_subscriptions').find({userId}).toArray()
    : [...memory().values()].filter(x=>x.userId===userId)

  let sent=0
  for(const row of rows){
    try{
      await webpush.sendNotification(row.subscription,JSON.stringify(payload))
      sent++
    }catch(e:any){
      if(e?.statusCode===404||e?.statusCode===410){
        if(db)await db.collection('push_subscriptions').deleteOne({endpoint:row.endpoint})
        else memory().delete(row.endpoint)
      }
    }
  }
  return {sent}
}
