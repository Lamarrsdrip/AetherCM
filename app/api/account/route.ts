import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { loadState, saveState, ensureAccount, accountSnapshotByUser, applyDailyAccrualIfDue, ensureDailyWindow, todaysPerformance } from '@/lib/store'

export async function GET(){
  const session=await getSession()
  if(!session)return NextResponse.json({error:'Please sign in.'},{status:401})
  const state=await loadState()
  const account=ensureAccount(state,session.email)
  const windowChanged=ensureDailyWindow(state,account.id)
  const accrued=applyDailyAccrualIfDue(state,account.id,account.name)
  if(windowChanged||accrued)await saveState(state)
  const snap=accountSnapshotByUser(state,account.id)
  const today=todaysPerformance(state,account.id)
  const performanceHistory=state.dailyPerformanceHistory.filter(h=>h.userId===account.id).slice(0,14)
  return NextResponse.json({
    ...snap,account,
    todayPnl:today.amount,todayPnlPct:today.pct,performanceHistory,
    adjustments:state.adjustments.filter(x=>x.userId===account.id),
    allocations:state.allocations.filter(x=>x.userId===account.id),
    transfers:state.transfers.filter(x=>x.userId===account.id)
  })
}
