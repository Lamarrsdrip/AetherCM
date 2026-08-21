import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'
import {jwtVerify} from 'jose'

const protectedPrefixes=['/dashboard','/portfolio','/markets','/transfers','/support','/admin','/api/account','/api/allocations','/api/transfers','/api/support','/api/notifications','/api/push','/api/admin']

async function session(req:NextRequest){
 const token=req.cookies.get('aether_session')?.value
 if(!token)return null
 const secret=process.env.JWT_SECRET || (process.env.NODE_ENV!=='production'?'aether-local-development-secret-change-me':'')
 if(!secret)return null
 try{
  const {payload}=await jwtVerify(token,new TextEncoder().encode(secret))
  return payload
 }catch{return null}
}

export async function middleware(req:NextRequest){
 const path=req.nextUrl.pathname
 if(!protectedPrefixes.some(p=>path===p||path.startsWith(p+'/')))return NextResponse.next()
 if(path==='/api/push/public-key')return NextResponse.next()

 const s=await session(req)
 if(!s){
  if(path.startsWith('/api/'))return NextResponse.json({error:'Please sign in.'},{status:401})
  const url=new URL('/login',req.url);url.searchParams.set('next',path);return NextResponse.redirect(url)
 }
 if((path.startsWith('/admin')||path.startsWith('/api/admin'))&&s.role!=='admin'){
  if(path.startsWith('/api/'))return NextResponse.json({error:'Administrator access required.'},{status:403})
  return NextResponse.redirect(new URL('/dashboard',req.url))
 }
 return NextResponse.next()
}

export const config={matcher:['/((?!_next/static|_next/image|favicon.ico|icons/|sw.js).*)']}
