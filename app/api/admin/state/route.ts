import { NextResponse } from 'next/server'
import { defaultAdminState } from '@/lib/data'
let state={...defaultAdminState}
export async function GET(){return NextResponse.json(state)}
export async function POST(req:Request){const next=await req.json(); state={...state,...next}; return NextResponse.json(state)}
