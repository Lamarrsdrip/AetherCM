import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { loadState, saveState, ensureAccount, accountSnapshotByUser, applyDailyAccrualIfDue } from '@/lib/store'

export async function GET(){
  const session=await getSession()
  if(!session)return NextResponse.json({error:'Please sign in.'},{status:401})
  const state=await loadState()
  const account=ensureAccount(state,session.email)
  if(applyDailyAccrualIfDue(state,account.id,account.name))await saveState(state)
  const snap=accountSnapshotByUser(state,account.id)
  const daily=state.adjustments.filter(a=>a.userId===account.id&&a.kind==='Scheduled daily gain').slice(0,7)
  return NextResponse.json({...snap,account,daily,allocations:state.allocations.filter(x=>x.userId===account.id),transfers:state.transfers.filter(x=>x.userId===account.id)})
}
