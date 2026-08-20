import {
  initialAdjustments,initialAllocations,initialDailyGain,initialShareControls,
  initialFundingMethods,initialTransfers,initialCryptoGateway,demoClient,
  type AccountAdjustment,type DailyGainRule,type ShareAllocation,type ShareControl,
  type FundingMethod,type TransferRequest,type ManualCryptoGateway
} from './ops'

type Store={
  allocations:ShareAllocation[]; adjustments:AccountAdjustment[]; dailyGain:DailyGainRule;
  shareControls:ShareControl[]; fundingMethods:FundingMethod[]; transfers:TransferRequest[];
  cryptoGateway:ManualCryptoGateway; lastAccrualDate:string|null
}
declare global { var __aetherStore:Store|undefined }

export function getStore():Store{
  if(!globalThis.__aetherStore){
    globalThis.__aetherStore={
      allocations:initialAllocations.map(x=>({...x})),
      adjustments:initialAdjustments.map(x=>({...x})),
      dailyGain:{...initialDailyGain},
      shareControls:initialShareControls.map(x=>({...x})),
      fundingMethods:initialFundingMethods.map(x=>({...x})),
      transfers:initialTransfers.map(x=>({...x})),
      cryptoGateway:{...initialCryptoGateway,addresses:initialCryptoGateway.addresses.map(x=>({...x}))},
      lastAccrualDate:null
    }
  }
  return globalThis.__aetherStore
}

export function sweepExpiredCryptoRequests(){
  const s=getStore(); const now=Date.now()
  s.transfers=s.transfers.map(t=>{
    if(t.method==='crypto'&&t.direction==='Deposit'&&t.status==='Pending'&&t.expiresAt&&new Date(t.expiresAt).getTime()<now){
      return {...t,status:'Expired' as const}
    }
    return t
  })
}

export function clientBalance(userId=demoClient.id){
  const s=getStore()
  const adjustments=s.adjustments.filter(a=>a.userId===userId).reduce((n,a)=>n+a.amount,0)
  const completedDeposits=s.transfers.filter(t=>t.userId===userId&&t.direction==='Deposit'&&t.status==='Completed').reduce((n,t)=>n+t.amount,0)
  const completedWithdrawals=s.transfers.filter(t=>t.userId===userId&&t.direction==='Withdrawal'&&t.status==='Completed').reduce((n,t)=>n+t.amount,0)
  return demoClient.baseBalance+adjustments+completedDeposits-completedWithdrawals
}

export function applyDailyAccrualIfDue(){
  const s=getStore(); if(!s.dailyGain.enabled) return s
  const today=new Date().toISOString().slice(0,10); if(s.lastAccrualDate===today) return s
  const current=clientBalance()
  const amount=s.dailyGain.mode==='percent'?current*(s.dailyGain.value/100):s.dailyGain.value
  if(Number.isFinite(amount)&&amount!==0){
    s.adjustments.unshift({
      id:`AUTO-${Date.now()}`,userId:demoClient.id,userName:demoClient.name,
      amount:Number(amount.toFixed(2)),kind:'Scheduled daily gain',
      note:s.dailyGain.label,createdAt:new Date().toLocaleString()
    })
  }
  s.lastAccrualDate=today
  return s
}

export function clientSnapshot(){
  sweepExpiredCryptoRequests()
  const s=applyDailyAccrualIfDue()
  const balance=clientBalance()
  const daily=s.adjustments.filter(a=>a.userId===demoClient.id&&a.kind==='Scheduled daily gain').slice(0,7)
  const approved=s.allocations.filter(a=>a.userId===demoClient.id&&a.status==='Approved')
  const invested=approved.reduce((n,a)=>n+a.value,0)
  return {balance,invested,available:Math.max(0,balance-invested),daily,approved}
}
