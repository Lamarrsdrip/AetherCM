import { NextResponse } from 'next/server'
import { pushStatus } from '@/lib/push'
export async function GET(){
  const s=pushStatus()
  if(!s.configured)return NextResponse.json({error:'Account alerts are not available yet.'},{status:503})
  return NextResponse.json({publicKey:s.publicKey})
}
