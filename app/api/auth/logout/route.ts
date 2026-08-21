import { NextResponse } from 'next/server'
import { sessionCookieName } from '@/lib/session'
export async function POST(){
  const res=NextResponse.json({ok:true})
  res.cookies.set(sessionCookieName,'',{httpOnly:true,path:'/',maxAge:0,sameSite:'lax',secure:process.env.NODE_ENV==='production'})
  res.cookies.set('aether_role','',{httpOnly:true,path:'/',maxAge:0})
  res.cookies.set('aether_email','',{httpOnly:true,path:'/',maxAge:0})
  return res
}
