import { NextResponse } from 'next/server'
import { databaseConfigured } from '@/lib/db'
import { emailStatus } from '@/lib/email'
import { pushStatus } from '@/lib/push'
export async function GET(){
  const db=databaseConfigured(),email=(await emailStatus()).configured,push=pushStatus().configured
  return NextResponse.json({status:db?'ok':'setup-required',services:{savedData:db,email,push,install:true}})
}
