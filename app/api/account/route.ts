import {NextResponse} from 'next/server'
import {clientSnapshot,getStore} from '@/lib/store'
export async function GET(){const s=getStore();return NextResponse.json({...clientSnapshot(),allocations:s.allocations.filter(x=>x.userId==='AC-20491'),transfers:s.transfers.filter(x=>x.userId==='AC-20491')})}
