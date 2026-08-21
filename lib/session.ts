import { SignJWT, jwtVerify } from 'jose'

export type AetherSession={role:'admin'|'client';email:string;userId:string}

const COOKIE='aether_session'

function secret(){
  const value=process.env.JWT_SECRET || (process.env.NODE_ENV!=='production'?'aether-local-development-secret-change-me':'')
  if(!value)throw new Error('JWT_SECRET is not configured')
  return new TextEncoder().encode(value)
}

export async function signSession(session:AetherSession){
  return await new SignJWT(session)
    .setProtectedHeader({alg:'HS256'})
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret())
}

export async function verifySession(token?:string|null):Promise<AetherSession|null>{
  if(!token)return null
  try{
    const {payload}=await jwtVerify(token,secret())
    if((payload.role!=='admin'&&payload.role!=='client')||!payload.email||!payload.userId)return null
    return {role:payload.role as 'admin'|'client',email:String(payload.email),userId:String(payload.userId)}
  }catch{return null}
}

export const sessionCookieName=COOKIE
export const sessionCookieOptions={
  httpOnly:true,
  sameSite:'lax' as const,
  secure:process.env.NODE_ENV==='production',
  path:'/',
  maxAge:60*60*24*7,
}
